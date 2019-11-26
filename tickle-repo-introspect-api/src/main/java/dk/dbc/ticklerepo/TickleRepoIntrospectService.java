/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 *  See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

package dk.dbc.ticklerepo;

import dk.dbc.jsonb.JSONBContext;
import dk.dbc.jsonb.JSONBException;
import dk.dbc.ticklerepo.dto.DataSetSummaryDTO;
import dk.dbc.ticklerepo.dto.DataSetSummaryListDTO;
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
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;

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
            final List<DataSetSummaryDTO> dataSets = new ArrayList<>();

            generateDummyData(dataSets);

            final DataSetSummaryListDTO list = new DataSetSummaryListDTO();
            list.setDataSets(dataSets);

            res = mapper.marshall(list);

            return Response.ok(res, MediaType.APPLICATION_JSON).build();
        } catch (JSONBException e) {
            LOGGER.error(e.getMessage());
            return Response.serverError().build();
        }
    }

    // TODO Get data from the database
    private void generateDummyData(List<DataSetSummaryDTO> dtos) {
        dtos.add(new DataSetSummaryDTO("150023-stucon", 47470, 47470, 0, "2018-04-04 13:37:07.678", "1290"));
        dtos.add(new DataSetSummaryDTO("150068-music", 28053, 28051, 2, "2018-07-24 10:36:56.837", "1330"));
        dtos.add(new DataSetSummaryDTO("150023-sicref", 19643, 19643, 0, "2019-09-12 14:22:40.017", "1518"));
        dtos.add(new DataSetSummaryDTO("150041-credo", 879, 879, 0, "2018-08-24 11:59:48.808", "1345"));
        dtos.add(new DataSetSummaryDTO("150059-ebog", 97, 90, 7, "2018-06-18 11:06:22.744", "1321"));
        dtos.add(new DataSetSummaryDTO("150059-netlydbog", 3478, 3478, 0, "2018-03-07 11:12:36.748", "1283"));
        dtos.add(new DataSetSummaryDTO("150018-tyskmel", 116, 116, 0, "2019-01-14 10:28:23.676", "1451"));
        dtos.add(new DataSetSummaryDTO("125420-m21", 408, 408, 0, "2019-09-06 08:44:17.162", "1516"));
        dtos.add(new DataSetSummaryDTO("150057-ebscobog", 5002, 5002, 0, "2019-02-25 14:36:06.279", "1459"));
        dtos.add(new DataSetSummaryDTO("150068-art", 43384, 43384, 0, "2018-07-24 10:58:12.477", "1331"));
        dtos.add(new DataSetSummaryDTO("150066-artikler", 8881, 8881, 0, "2017-09-07 09:20:50.833", "1105"));
        dtos.add(new DataSetSummaryDTO("150031-sted", 1048, 1048, 0, "2018-11-19 14:22:18.577", "1376"));
        dtos.add(new DataSetSummaryDTO("150079-film", 1564, 1564, 0, "2018-10-04 11:49:43.814", "1361"));
        dtos.add(new DataSetSummaryDTO("150038-ebog", 88, 88, 0, "2019-02-20 13:27:35.532", "1458"));
        dtos.add(new DataSetSummaryDTO("150008-academic", 60001, 10001, 50000, "2018-06-21 10:35:57.545", "1329"));
        dtos.add(new DataSetSummaryDTO("150010-smallengine", 1, 1, 0, "2018-01-10 15:31:15.191", "1272"));
        dtos.add(new DataSetSummaryDTO("150069-sms", 127, 114, 13, "2018-02-26 17:11:01.741", "1282"));
        dtos.add(new DataSetSummaryDTO("150015-forlag", 57819, 55912, 1907, "2018-05-25 15:34:35.862", "1308"));
        dtos.add(new DataSetSummaryDTO("150008-public", 42825, 10100, 32725, "2018-06-20 11:13:51.883", "1327"));
        dtos.add(new DataSetSummaryDTO("150010-master", 178901, 74676, 104225, "2019-10-02 07:58:09.451", "1510"));
        dtos.add(new DataSetSummaryDTO("150005-artikler", 10123, 10122, 1, "2017-12-14 15:09:04.146", "1270"));
        dtos.add(new DataSetSummaryDTO("150078-viaf", 172628, 170751, 1877, "2019-10-02 08:42:19.695", "1524"));
        dtos.add(new DataSetSummaryDTO("125320-m21", 34880, 34833, 47, "2019-09-18 08:17:47.906", "1520"));
        dtos.add(new DataSetSummaryDTO("150058-kunfyn", 371, 371, 0, "2017-10-04 10:12:15.55", "1175"));
        dtos.add(new DataSetSummaryDTO("150044-safari", 235, 235, 0, "2018-09-25 15:50:41.703", "1358"));
        dtos.add(new DataSetSummaryDTO("125420-issn", 408, 408, 0, "2019-08-06 13:24:49.904", "1480"));
        dtos.add(new DataSetSummaryDTO("150070-comics", 6000, 6000, 0, "2019-01-31 09:57:39.997", "1455"));
        dtos.add(new DataSetSummaryDTO("150023-biocon", 511314, 511314, 0, "2018-10-10 15:12:49.697", "1365"));
        dtos.add(new DataSetSummaryDTO("150062-hisver", 1840, 1618, 222, "2017-09-29 10:54:41.735", "1122"));
        dtos.add(new DataSetSummaryDTO("150033-dandyr", 672, 672, 0, "2017-06-21 10:06:15.528", "99"));
        dtos.add(new DataSetSummaryDTO("150018-biologi", 255, 251, 4, "2018-10-25 15:50:58.965", "1398"));
        dtos.add(new DataSetSummaryDTO("150023-glicon", 987, 987, 0, "2019-09-12 13:55:12.334", "1517"));
        dtos.add(new DataSetSummaryDTO("150059-magasin", 342, 342, 0, "2018-05-24 13:01:00.479", "1305"));
        dtos.add(new DataSetSummaryDTO("150061-netlydbog", 1812, 1812, 0, "2018-08-14 13:45:03.126", "1343"));
        dtos.add(new DataSetSummaryDTO("150057-ucngobi", 5, 5, 0, "2018-10-10 10:35:30.598", "1363"));
        dtos.add(new DataSetSummaryDTO("150010-currentbio", 50000, 50000, 0, "2019-02-11 15:47:21.716", "1456"));
        dtos.add(new DataSetSummaryDTO("125090-m21", 5923, 5923, 0, "2019-08-27 10:18:49.768", "1499"));
        dtos.add(new DataSetSummaryDTO("150063-persbas", 32095, 32095, 0, "2017-11-04 18:37:32.01", "1267"));
        dtos.add(new DataSetSummaryDTO("150023-litres", 30920, 30920, 0, "2018-04-09 16:14:40.176", "1294"));
        dtos.add(new DataSetSummaryDTO("150060-pressdisp", 7517, 7517, 0, "2018-05-30 11:51:34.979", "1310"));
        dtos.add(new DataSetSummaryDTO("150033-verdyr", 282, 281, 1, "2017-10-02 09:43:18.657", "1125"));
        dtos.add(new DataSetSummaryDTO("150063-virkbas", 32416, 32416, 0, "2017-11-04 18:22:16.59", "1266"));
        dtos.add(new DataSetSummaryDTO("123456-viaf", 3, 3, 0, "2018-07-26 15:03:17.932", "1332"));
        dtos.add(new DataSetSummaryDTO("150024-bibvagt", 14718, 14717, 1, "2017-10-26 10:06:14.498", "1109"));
        dtos.add(new DataSetSummaryDTO("150065-mangolang", 1, 1, 0, "2018-10-15 14:38:35.136", "1366"));
        dtos.add(new DataSetSummaryDTO("150012-leksikon", 4224, 4219, 5, "2017-08-23 21:11:28.943", "1102"));
        dtos.add(new DataSetSummaryDTO("150071-ebog", 54563, 54563, 0, "2017-10-30 15:40:27.292", "1260"));
        dtos.add(new DataSetSummaryDTO("150061-ebog", 5627, 5627, 0, "2018-08-14 13:53:32.786", "1344"));
    }
}
