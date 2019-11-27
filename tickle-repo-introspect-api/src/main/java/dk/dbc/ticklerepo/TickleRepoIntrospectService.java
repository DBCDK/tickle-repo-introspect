/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 *  See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

package dk.dbc.ticklerepo;

import dk.dbc.jsonb.JSONBContext;
import dk.dbc.jsonb.JSONBException;
import dk.dbc.marc.binding.MarcRecord;
import dk.dbc.marc.reader.MarcReaderException;
import dk.dbc.marc.reader.MarcXchangeV1Reader;
import dk.dbc.marc.writer.DanMarc2LineFormatWriter;
import dk.dbc.marc.writer.MarcWriterException;
import dk.dbc.ticklerepo.dto.DataSet;
import dk.dbc.ticklerepo.dto.DataSetSummary;
import dk.dbc.ticklerepo.dto.DataSetSummaryListDTO;
import dk.dbc.ticklerepo.dto.ErrorDTO;
import dk.dbc.ticklerepo.dto.Record;
import dk.dbc.util.StopwatchInterceptor;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.interceptor.Interceptors;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.ByteArrayInputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Interceptors(StopwatchInterceptor.class)
@Stateless
@Path("")
public class TickleRepoIntrospectService {
    private static final Logger LOGGER = LoggerFactory.getLogger(TickleRepoIntrospectService.class);
    private static final JSONBContext mapper = new JSONBContext();
    private static final DanMarc2LineFormatWriter DANMARC_2_LINE_FORMAT_WRITER = new DanMarc2LineFormatWriter();

    @PersistenceContext(unitName = "tickleRepoPU")
    private EntityManager entityManager;

    @EJB
    TickleRepo tickleRepo;

    @Inject
    @ConfigProperty(name = "INSTANCE", defaultValue = "")
    private String INSTANCE;

    @GET
    @Produces({MediaType.TEXT_PLAIN})
    @Path("v1/instance")
    public Response getConfig() {
        return Response.ok(INSTANCE).build();
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    @Path("v1/datasets")
    public Response getDataSetSummary() {
        String res;

        try {
            final List<DataSetSummary> dataSets = tickleRepo.getDataSetSummary();
            final DataSetSummaryListDTO list = new DataSetSummaryListDTO();

            list.setDataSets(dataSets);

            res = mapper.marshall(list);

            return Response.ok(res, MediaType.APPLICATION_JSON).build();
        } catch (JSONBException e) {
            LOGGER.error(e.getMessage());
            return Response.serverError().build();
        }
    }

    @GET
    @Produces({MediaType.TEXT_PLAIN})
    @Path("v1/record/{pid}")
    public Response getRecordByPid(@PathParam("pid") String pid,
                                   @DefaultValue("LINE") @QueryParam("format") String format) {
        String res;

        try {
            if (!Arrays.asList("LINE", "XML", "RAW").contains(format.toUpperCase())) {
                final ErrorDTO errorDTO = new ErrorDTO(400, "Bad format param. Must be either LINE, XML or RAW");

                res = mapper.marshall(errorDTO);

                return Response.status(400).entity(res).build();
            }

            if (!pid.contains(":")) {
                final ErrorDTO errorDTO = new ErrorDTO(400, "Bad Pid format");

                res = mapper.marshall(errorDTO);

                return Response.status(400).entity(res).build();
            }

            final String[] values = pid.split(":");
            final String dataSetName = values[0];
            final String localId = values[1];

            // More pid validation here?

            final DataSet lookupDataSet = new DataSet()
                    .withName(dataSetName);

            final Optional<DataSet> dataSet = tickleRepo.lookupDataSet(lookupDataSet);

            if (!dataSet.isPresent()) {
                final ErrorDTO errorDTO = new ErrorDTO(400, "No dataset found with name '" + dataSetName + "'");

                res = mapper.marshall(errorDTO);

                return Response.status(400).entity(res).build();
            }

            final Record lookupRecord = new Record()
                    .withLocalId(localId)
                    .withDataset(dataSet.get().getId());


            final Optional<Record> record = tickleRepo.lookupRecord(lookupRecord);

            if (!record.isPresent()) {
                final ErrorDTO errorDTO = new ErrorDTO(400, "No record found with local id '" + localId + "' and dataset name '" + dataSetName + "'");

                res = mapper.marshall(errorDTO);

                return Response.status(400).entity(res).build();
            }

            res = recordDataToText(record.get().getContent(), format);

            return Response.ok(res, MediaType.TEXT_PLAIN).build();
        } catch (JSONBException e) {
            LOGGER.error(e.getMessage());
            return Response.serverError().build();
        }
    }

    private String recordDataToText(byte[] content, String format) {
        try {
            if ("LINE".equalsIgnoreCase(format)) {

                final MarcXchangeV1Reader reader = new MarcXchangeV1Reader(new ByteArrayInputStream(content), StandardCharsets.UTF_8);

                final MarcRecord record = reader.read();

                String rawLines = new String(DANMARC_2_LINE_FORMAT_WRITER.write(record, StandardCharsets.UTF_8));

                // Replace all *<single char><value> with <space>*<single char><space><value>. E.g. *aThis is the value -> *a This is the value
                rawLines = rawLines.replaceAll("(\\*[aA0-zZ9|&])", " $1 ");

                // Replace double space with single space in front of subfield marker
                rawLines = rawLines.replaceAll(" {2}\\*", " \\*");

                // If the previous line is exactly 82 chars long it will result in an blank line with 4 spaces, so we'll remove that
                rawLines = rawLines.replaceAll(" {4}\n", "");

                return rawLines;
            }
        } catch (MarcWriterException | MarcReaderException e) {
            LOGGER.info("MarcXChange transform to line failed with error '{}'. Trying as XML instead", e.getMessage());
        }

        try {
            if ("XML".equalsIgnoreCase(format)) {
                final String recordContent = new String(content, StandardCharsets.UTF_8);
                final Source xmlInput = new StreamSource(new StringReader(recordContent));
                final StringWriter stringWriter = new StringWriter();
                final StreamResult xmlOutput = new StreamResult(stringWriter);
                final TransformerFactory transformerFactory = TransformerFactory.newInstance();
                transformerFactory.setAttribute("indent-number", 4);
                final Transformer transformer = transformerFactory.newTransformer();
                transformer.setOutputProperty(OutputKeys.INDENT, "yes");
                transformer.transform(xmlInput, xmlOutput);

                return xmlOutput.getWriter().toString();
            }
        } catch (TransformerException e) {
            LOGGER.info("XML transform failed with error '{}'. Returning raw content instead", e.getMessage());
        }

        return new String(content);
    }
}
