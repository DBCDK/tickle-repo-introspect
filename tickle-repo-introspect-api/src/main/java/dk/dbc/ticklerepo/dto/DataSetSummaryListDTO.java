/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 *  See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

package dk.dbc.ticklerepo.dto;

import java.util.List;

public class DataSetSummaryListDTO {

    private List<DataSetSummaryDTO> dataSets;

    public List<DataSetSummaryDTO> getDataSets() {
        return dataSets;
    }

    public void setDataSets(List<DataSetSummaryDTO> dataSets) {
        this.dataSets = dataSets;
    }
}
