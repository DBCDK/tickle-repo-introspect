/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 *  See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

package dk.dbc.ticklerepo.dto;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class DataSetSummaryDTO {

    private final static SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");

    private String name;
    private int countTotal;
    private int countActive;
    private int countDeleted;
    private Date modified;
    private String batchId;

    public DataSetSummaryDTO() {
    }

    // TODO Modified should be a Date
    public DataSetSummaryDTO(String name, int countTotal, int countActive, int countDeleted, String modified, String batchId) {
        this.name = name;
        this.countTotal = countTotal;
        this.countActive = countActive;
        this.countDeleted = countDeleted;
        try {
            this.modified = formatter.parse(modified);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        this.batchId = batchId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCountTotal() {
        return countTotal;
    }

    public void setCountTotal(int countTotal) {
        this.countTotal = countTotal;
    }

    public int getCountActive() {
        return countActive;
    }

    public void setCountActive(int countActive) {
        this.countActive = countActive;
    }

    public int getCountDeleted() {
        return countDeleted;
    }

    public void setCountDeleted(int countDeleted) {
        this.countDeleted = countDeleted;
    }

    public Date getModified() {
        return modified;
    }

    public void setModified(Date modified) {
        this.modified = modified;
    }

    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }
}
