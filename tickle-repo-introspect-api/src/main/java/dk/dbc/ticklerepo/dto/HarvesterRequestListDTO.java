package dk.dbc.ticklerepo.dto;

import java.util.List;

public class HarvesterRequestListDTO {

    private List<HarvestRequestDTO> requests;

    public List<HarvestRequestDTO> getRequests() {
        return requests;
    }

    public void setRequests(List<HarvestRequestDTO> requests) {
        this.requests = requests;
    }
}
