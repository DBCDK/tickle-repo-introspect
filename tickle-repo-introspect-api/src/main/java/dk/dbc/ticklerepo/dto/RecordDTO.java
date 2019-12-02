package dk.dbc.ticklerepo.dto;

import java.sql.Timestamp;

public class RecordDTO {

    private int id;
    private int batch;
    private int dataset;
    private String localId;
    private String trackingId;
    private String status;
    private Timestamp timeOfCreation;
    private Timestamp timeOfLastModification;
    private String checksum;
    private String contentLine;
    private String contentXml;
    private String contentRaw;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getBatch() {
        return batch;
    }

    public void setBatch(int batch) {
        this.batch = batch;
    }

    public int getDataset() {
        return dataset;
    }

    public void setDataset(int dataset) {
        this.dataset = dataset;
    }

    public String getLocalId() {
        return localId;
    }

    public void setLocalId(String localId) {
        this.localId = localId;
    }

    public String getTrackingId() {
        return trackingId;
    }

    public void setTrackingId(String trackingId) {
        this.trackingId = trackingId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getTimeOfCreation() {
        return timeOfCreation;
    }

    public void setTimeOfCreation(Timestamp timeOfCreation) {
        this.timeOfCreation = timeOfCreation;
    }

    public Timestamp getTimeOfLastModification() {
        return timeOfLastModification;
    }

    public void setTimeOfLastModification(Timestamp timeOfLastModification) {
        this.timeOfLastModification = timeOfLastModification;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public String getContentLine() {
        return contentLine;
    }

    public void setContentLine(String contentLine) {
        this.contentLine = contentLine;
    }

    public String getContentXml() {
        return contentXml;
    }

    public void setContentXml(String contentXml) {
        this.contentXml = contentXml;
    }

    public String getContentRaw() {
        return contentRaw;
    }

    public void setContentRaw(String contentRaw) {
        this.contentRaw = contentRaw;
    }

    @Override
    public String toString() {
        return "RecordDTO{" +
                "id=" + id +
                ", batch=" + batch +
                ", dataset=" + dataset +
                ", localId='" + localId + '\'' +
                ", trackingId='" + trackingId + '\'' +
                ", status='" + status + '\'' +
                ", timeOfCreation=" + timeOfCreation +
                ", timeOfLastModification=" + timeOfLastModification +
                ", checksum='" + checksum + '\'' +
                ", contentLine='" + contentLine + '\'' +
                ", contentXml='" + contentXml + '\'' +
                ", contentRaw='" + contentRaw + '\'' +
                '}';
    }
}
