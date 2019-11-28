/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 *  See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

package dk.dbc.ticklerepo;

import dk.dbc.jsonb.JSONBContext;
import dk.dbc.jsonb.JSONBException;
import dk.dbc.marc.binding.ControlField;
import dk.dbc.marc.binding.Field;
import dk.dbc.marc.binding.MarcRecord;
import dk.dbc.marc.reader.MarcReaderException;
import dk.dbc.marc.reader.MarcXchangeV1Reader;
import dk.dbc.marc.writer.DanMarc2LineFormatWriter;
import dk.dbc.marc.writer.LineFormatWriter;
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
@Path("v1")
public class TickleRepoIntrospectService {
    private static final Logger LOGGER = LoggerFactory.getLogger(TickleRepoIntrospectService.class);
    private static final DanMarc2LineFormatWriter DANMARC_2_LINE_FORMAT_WRITER = new DanMarc2LineFormatWriter();
    private static final LineFormatWriter LINE_FORMAT_WRITER = new LineFormatWriter();

    @PersistenceContext(unitName = "tickleRepoPU")
    private EntityManager entityManager;

    @EJB
    TickleRepo tickleRepo;

    @Inject
    @ConfigProperty(name = "INSTANCE", defaultValue = "")
    private String INSTANCE;

    @GET
    @Produces({MediaType.TEXT_PLAIN})
    @Path("instance")
    public Response getConfig() {
        return Response.ok(INSTANCE).build();
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    @Path("datasets")
    public Response getDataSetSummary() {
        final List<DataSetSummary> dataSets = tickleRepo.getDataSetSummary();
        final DataSetSummaryListDTO list = new DataSetSummaryListDTO();

        list.setDataSets(dataSets);

        return Response.ok(list, MediaType.APPLICATION_JSON).build();
    }

    @GET
    @Produces({MediaType.TEXT_PLAIN})
    @Path("records/{recordId}")
    public Response getRecordByRecordId(@PathParam("recordId") String recordId,
                                        @DefaultValue("LINE") @QueryParam("format") String format) {
        String res;

        if (!Arrays.asList("LINE", "XML", "RAW").contains(format.toUpperCase())) {
            return Response
                    .status(400)
                    .entity(new ErrorDTO(400, "Bad format param. Must be either LINE, XML or RAW"))
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }

        // recordId is of the format <dataset name>:<record localid>
        // Examples:
        // 125320-m21:00003196
        // 150024-bibvagt:002da116-5827-a6e4-fd70-d85bbb97c099
        if (!recordId.contains(":")) {
            return Response
                    .status(400)
                    .entity(new ErrorDTO(400, "Bad record id format"))
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }

        final String[] values = recordId.split(":");
        final String dataSetName = values[0];
        final String localId = values[1];

        // More record id validation here?

        final DataSet lookupDataSet = new DataSet()
                .withName(dataSetName);
        final Optional<DataSet> dataSet = tickleRepo.lookupDataSet(lookupDataSet);

        if (!dataSet.isPresent()) {
            return Response
                    .status(400)
                    .entity(new ErrorDTO(400, "No dataset found with name '" + dataSetName + "'"))
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }

        final Record lookupRecord = new Record()
                .withLocalId(localId)
                .withDataset(dataSet.get().getId());
        final Optional<Record> record = tickleRepo.lookupRecord(lookupRecord);

        if (!record.isPresent()) {
            return Response
                    .status(400)
                    .entity(new ErrorDTO(400, "No record found with local id '" + localId + "' and dataset name '" + dataSetName + "'"))
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }

        res = recordDataToText(record.get().getContent(), format);

        return Response.ok(res, MediaType.TEXT_PLAIN).build();
    }

    private String recordDataToText(byte[] content, String format) {
        try {
            if ("LINE".equalsIgnoreCase(format)) {
                final MarcXchangeV1Reader reader = new MarcXchangeV1Reader(new ByteArrayInputStream(content), StandardCharsets.UTF_8);
                final MarcRecord record = reader.read();

                String rawLines = "";

                Field field001 = record.getField(MarcRecord.hasTag("001")).get(); // All record formats should have field 001
                // Check if the record is marc21. If so use generic line format writer.
                // If not marc21 then Danmarc2 format is assumed and specific line format writer used
                if (field001 instanceof ControlField) {
                    rawLines = new String(LINE_FORMAT_WRITER.write(record, StandardCharsets.UTF_8));

                    // Replace all $<single char><value> with <space>$<single char><space><value>. E.g. $aThis is the value -> $a This is the value
                    rawLines = rawLines.replaceAll("(\\$[aA0-zZ9|&])", " $1 ");
                } else {
                    rawLines = new String(DANMARC_2_LINE_FORMAT_WRITER.write(record, StandardCharsets.UTF_8));

                    // Replace all *<single char><value> with <space>*<single char><space><value>. E.g. *aThis is the value -> *a This is the value
                    rawLines = rawLines.replaceAll("(\\*[aA0-zZ9|&])", " $1 ");

                    // Replace double space with single space in front of subfield marker
                    rawLines = rawLines.replaceAll(" {2}\\*", " \\*");
                }

                // If the previous line is exactly 82 chars long it will result in an blank line with 4 spaces, so we'll remove that
                rawLines = rawLines.replaceAll(" {4}\n", "");

                return rawLines;
            }
        } catch (MarcWriterException | MarcReaderException e) {
            // We don't really care about this exception to just log it as info
            LOGGER.info("MarcXChange transform to line failed with error '{}'. Trying as XML instead", e.getMessage());
        }

        try {
            // If we reach this point it is either because the format is XML or because LINE conversion failed
            // If LINE conversion failed we want to try with XML conversion in stead
            if ("XML".equalsIgnoreCase(format) || "LINE".equalsIgnoreCase(format)) {
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
            // We don't really care about this exception to just log it as info
            LOGGER.info("XML transform failed with error '{}'. Returning raw content instead", e.getMessage());
        }

        // Converting to LINE or XML failed to just return the raw content
        return new String(content);
    }
}
