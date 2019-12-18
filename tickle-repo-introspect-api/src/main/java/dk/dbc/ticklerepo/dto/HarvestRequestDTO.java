package dk.dbc.ticklerepo.dto;

import java.util.List;

public class HarvestRequestDTO {

    private int harvesterid;
    private List<String> recordIds;

    public int getHarvesterid() {
        return harvesterid;
    }

    public void setHarvesterid(int harvesterid) {
        this.harvesterid = harvesterid;
    }

    public List<String> getRecordIds() {
        return recordIds;
    }

    public void setRecordIds(List<String> recordIds) {
        this.recordIds = recordIds;
    }

    @Override
    public String toString() {
        return "HarvestRequestDTO{" +
                "harvesterid=" + harvesterid +
                ", recordIds=" + recordIds +
                '}';
    }
}
