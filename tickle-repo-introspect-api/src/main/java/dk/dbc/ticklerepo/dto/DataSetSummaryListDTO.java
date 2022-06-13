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
