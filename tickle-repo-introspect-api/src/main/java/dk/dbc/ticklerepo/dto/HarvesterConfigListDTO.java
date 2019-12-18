package dk.dbc.ticklerepo.dto;

import java.util.List;

public class HarvesterConfigListDTO {

    private List<HarvesterConfigDTO> harvesters;

    public List<HarvesterConfigDTO> getHarvesters() {
        return harvesters;
    }

    public void setHarvesters(List<HarvesterConfigDTO> harvesters) {
        this.harvesters = harvesters;
    }
}

