/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 *  See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

package dk.dbc.ticklerepo.dto;

public class DataSetSummaryDTO {

    private String name;
    private long sum;
    private long active;
    private long deleted;
    private long reset;
    private long timeOfLastModification;
    private int batchId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getSum() {
        return sum;
    }

    public void setSum(long sum) {
        this.sum = sum;
    }

    public long getActive() {
        return active;
    }

    public void setActive(long active) {
        this.active = active;
    }

    public long getDeleted() {
        return deleted;
    }

    public void setDeleted(long deleted) {
        this.deleted = deleted;
    }

    public long getReset() {
        return reset;
    }

    public void setReset(long reset) {
        this.reset = reset;
    }

    public long getTimeOfLastModification() {
        return timeOfLastModification;
    }

    public void setTimeOfLastModification(long timeOfLastModification) {
        this.timeOfLastModification = timeOfLastModification;
    }

    public int getBatchId() {
        return batchId;
    }

    public void setBatchId(int batchId) {
        this.batchId = batchId;
    }

    @Override
    public String toString() {
        return "DataSetSummaryDTO{" +
                "name='" + name + '\'' +
                ", sum=" + sum +
                ", active=" + active +
                ", deleted=" + deleted +
                ", reset=" + reset +
                ", timeOfLastModification=" + timeOfLastModification +
                ", batchId=" + batchId +
                '}';
    }
}
