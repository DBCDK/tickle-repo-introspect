/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 *  See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

package dk.dbc.ticklerepo;

import dk.dbc.jsonb.JSONBContext;
import dk.dbc.jsonb.JSONBException;
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
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;
import java.util.Optional;

@Interceptors(StopwatchInterceptor.class)
@Stateless
@Path("")
public class TickleRepoIntrospectService {
    private static final Logger LOGGER = LoggerFactory.getLogger(TickleRepoIntrospectService.class);
    private final JSONBContext mapper = new JSONBContext();

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
    @Produces({MediaType.APPLICATION_JSON})
    @Path("v1/record/{pid}")
    public Response getRecordByPid(@PathParam("pid") String pid) {
        String res;

        try {
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

            res = mapper.marshall(record.get());

            return Response.ok(res, MediaType.APPLICATION_JSON).build();
        } catch (JSONBException e) {
            LOGGER.error(e.getMessage());
            return Response.serverError().build();
        }
    }
}
