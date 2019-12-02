/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 *  See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

package dk.dbc.ticklerepo;

import dk.dbc.ticklerepo.dto.DataSet;
import dk.dbc.ticklerepo.dto.DataSetListDTO;
import dk.dbc.ticklerepo.dto.DataSetSummary;
import dk.dbc.ticklerepo.dto.DataSetSummaryListDTO;
import dk.dbc.ticklerepo.dto.Record;
import dk.dbc.ticklerepo.dto.RecordDTO;
import dk.dbc.ticklerepo.dto.RecordTransformer;
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
@Path("v1")
public class TickleRepoIntrospectService {
    private static final Logger LOGGER = LoggerFactory.getLogger(TickleRepoIntrospectService.class);


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
    @Produces({MediaType.APPLICATION_JSON})
    @Path("records/{recordId}")
    public Response getRecordByRecordId(@PathParam("recordId") String recordId) {
        // recordId is of the format <dataset name>:<record localid>
        // Examples:
        // 125320-m21:00003196
        // 150024-bibvagt:002da116-5827-a6e4-fd70-d85bbb97c099
        if (!recordId.contains(":")) {
            return Response.ok(null, MediaType.APPLICATION_JSON).build();
        }

        final String[] values = recordId.split(":");
        final String dataSetName = values[0];
        final String localId = values[1];

        final DataSet lookupDataSet = new DataSet()
                .withName(dataSetName);
        final Optional<DataSet> dataSet = tickleRepo.lookupDataSet(lookupDataSet);

        if (!dataSet.isPresent()) {
            // No record found - return null
            return Response.ok(null, MediaType.APPLICATION_JSON).build();
        }

        final Record lookupRecord = new Record()
                .withLocalId(localId)
                .withDataset(dataSet.get().getId());
        final Optional<Record> record = tickleRepo.lookupRecord(lookupRecord);

        if (!record.isPresent()) {
            // No datasets found - return null
            return Response.ok(null, MediaType.APPLICATION_JSON).build();
        }

        final RecordDTO dto = RecordTransformer.recordToDTO(record.get());

        return Response.ok(dto).build();
    }

    @GET
    @Produces({MediaType.TEXT_PLAIN})
    @Path("datasets/by-local-id/{localId}")
    public Response getDataSetsByRecordId(@PathParam("localId") String localId) {
        final Record lookupRecord = new Record()
                .withLocalId(localId);

        final List<DataSet> dataSets = tickleRepo.lookupDataSetByRecord(lookupRecord);

        final DataSetListDTO result = new DataSetListDTO();
        result.setDatasets(dataSets);

        return Response.ok(result, MediaType.APPLICATION_JSON).build();
    }

}
