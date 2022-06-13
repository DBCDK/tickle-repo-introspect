/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 *  See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

package dk.dbc.ticklerepo;

import dk.dbc.dataio.common.utils.flowstore.FlowStoreServiceConnectorException;
import dk.dbc.dataio.common.utils.flowstore.ejb.FlowStoreServiceConnectorBean;
import dk.dbc.dataio.harvester.connector.ejb.TickleHarvesterServiceConnectorBean;
import dk.dbc.dataio.harvester.task.connector.HarvesterTaskServiceConnectorException;
import dk.dbc.dataio.harvester.types.HarvestRecordsRequest;
import dk.dbc.dataio.harvester.types.TickleRepoHarvesterConfig;
import dk.dbc.ticklerepo.dto.DTOTransformer;
import dk.dbc.ticklerepo.dto.DataSet;
import dk.dbc.ticklerepo.dto.DataSetListDTO;
import dk.dbc.ticklerepo.dto.DataSetSummary;
import dk.dbc.ticklerepo.dto.DataSetSummaryDTO;
import dk.dbc.ticklerepo.dto.HarvestRequestDTO;
import dk.dbc.ticklerepo.dto.HarvestRequestDTOException;
import dk.dbc.ticklerepo.dto.HarvesterConfigDTO;
import dk.dbc.ticklerepo.dto.HarvesterConfigListDTO;
import dk.dbc.ticklerepo.dto.HarvesterRequestListDTO;
import dk.dbc.ticklerepo.dto.Record;
import dk.dbc.ticklerepo.dto.RecordDTO;
import dk.dbc.util.StopwatchInterceptor;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.interceptor.Interceptors;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Interceptors(StopwatchInterceptor.class)
@Stateless
@Path("v1")
public class TickleRepoIntrospectService {
    private static final Logger LOGGER = LoggerFactory.getLogger(TickleRepoIntrospectService.class);

    @EJB
    FlowStoreServiceConnectorBean flowStoreServiceConnectorBean;

    @EJB
    TickleHarvesterServiceConnectorBean tickleHarvesterServiceConnectorBean;

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
    @Path("datasets/{submitterId}")
    public Response getDataSetsBySubmitter(@PathParam("submitterId") int submitterId) {
        List<DataSet> dataSets = tickleRepo.getDataSetsBySubmitter(submitterId);

        DataSetListDTO dto = new DataSetListDTO();
        dto.setDatasets(dataSets);

        return Response.ok(dto, MediaType.APPLICATION_JSON).build();
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    @Path("datasets/summary/{dataSetId}")
    public Response getDataSetSummary(@PathParam("dataSetId") int dataSetId) {
        final DataSetSummary summary = tickleRepo.getDataSetSummaryByDataSetId(dataSetId);
        if (summary == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("No such dataset id " + dataSetId).build();
        }
        final DataSetSummaryDTO dto = DTOTransformer.dataSetSummaryToDTO(summary);

        return Response.ok(dto, MediaType.APPLICATION_JSON).build();
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

        final RecordDTO dto = DTOTransformer.recordToDTO(record.get());

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

    @GET
    @Produces({MediaType.TEXT_PLAIN})
    @Path("harvesters")
    public Response getHarvesters() {

        try {
            List<TickleRepoHarvesterConfig> configs = flowStoreServiceConnectorBean.getConnector().findHarvesterConfigsByType(TickleRepoHarvesterConfig.class);

            final HarvesterConfigListDTO result = new HarvesterConfigListDTO();
            result.setHarvesters(DTOTransformer.harvesterListToDTO(configs)
                    .stream()
                    .sorted(Comparator.comparing(HarvesterConfigDTO::getName, String.CASE_INSENSITIVE_ORDER))
                    .collect(Collectors.toList()));

            return Response.ok(result, MediaType.APPLICATION_JSON).build();
        } catch (FlowStoreServiceConnectorException e) {
            LOGGER.error("Caught FlowStoreServiceConnectorException: {}", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("harvesters/request")
    public Response addHarvestRequest(HarvesterRequestListDTO requestList) {

        final ArrayList<HarvestRequestDTO> successful = new ArrayList<>();

        for (HarvestRequestDTO dto : requestList.getRequests()) {
            try {
                HarvestRecordsRequest request = DTOTransformer.HarvestRequestFromDTO(dto);
                tickleHarvesterServiceConnectorBean.getConnector().createHarvestTask(dto.getHarvesterid(), request);
                LOGGER.info("Created harvest task for harvester {} with {} records", dto.getHarvesterid(), request.getRecords().size());
                successful.add(dto);
            } catch (HarvestRequestDTOException he) {
                LOGGER.error("Failed to create HarvestRequest from dto: {}", he.getMessage());
                LOGGER.error("Failing dto was: {}", dto);
                return Response.status(Response.Status.BAD_REQUEST).entity(he.getMessage()).build();
            } catch (HarvesterTaskServiceConnectorException ce) {
                LOGGER.error("Failed to create harvest task: {}", ce.getMessage());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(ce.getMessage()).build();
            }
        }

        final HarvesterRequestListDTO result = new HarvesterRequestListDTO();
        result.setRequests(successful);

        return Response.ok(result).build();
    }
}
