/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 *  See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

package dk.dbc.ticklerepo.dto;

import dk.dbc.dataio.harvester.types.TickleRepoHarvesterConfig;
import dk.dbc.marc.binding.ControlField;
import dk.dbc.marc.binding.Field;
import dk.dbc.marc.binding.MarcRecord;
import dk.dbc.marc.reader.MarcReaderException;
import dk.dbc.marc.reader.MarcXchangeV1Reader;
import dk.dbc.marc.writer.DanMarc2LineFormatWriter;
import dk.dbc.marc.writer.LineFormatWriter;
import dk.dbc.marc.writer.MarcWriterException;

import javax.xml.transform.OutputKeys;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.ByteArrayInputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class DTOTransformer {
    private static final DanMarc2LineFormatWriter DANMARC_2_LINE_FORMAT_WRITER = new DanMarc2LineFormatWriter();
    private static final LineFormatWriter LINE_FORMAT_WRITER = new LineFormatWriter();

    static {
        LINE_FORMAT_WRITER.setProperty(LineFormatWriter.Property.INCLUDE_LEADER, true);
    }

    public static List<DataSetSummaryDTO> dataSetSummaryListToDTO(List<DataSetSummary> dataSetSummaryList) {
        final List<DataSetSummaryDTO> dtos = new ArrayList<>();

        for (DataSetSummary dataSetSummary : dataSetSummaryList) {
            dtos.add(dataSetSummaryToDTO(dataSetSummary));
        }

        return dtos;
    }

    public static DataSetSummaryDTO dataSetSummaryToDTO(DataSetSummary dataSetSummary) {
        final DataSetSummaryDTO dto = new DataSetSummaryDTO();

        dto.setName(dataSetSummary.getName());
        dto.setSum(dataSetSummary.getSum());
        dto.setActive(dataSetSummary.getActive());
        dto.setDeleted(dataSetSummary.getDeleted());
        dto.setReset(dataSetSummary.getReset());
        dto.setTimeOfLastModification(dataSetSummary.getTimeOfLastModification().getTime());
        dto.setBatchId(dataSetSummary.getBatchId());

        return dto;
    }

    public static RecordDTO recordToDTO(Record record) {
        final RecordDTO dto = new RecordDTO();

        dto.setId(record.getId());
        dto.setBatch(record.getBatch());
        dto.setDataset(record.getDataset());
        dto.setLocalId(record.getLocalId());
        dto.setTrackingId(record.getTrackingId());
        dto.setStatus(record.getStatus().toString());
        dto.setTimeOfCreation(record.getTimeOfCreation().getTime());
        dto.setTimeOfLastModification(record.getTimeOfLastModification().getTime());
        dto.setChecksum(record.getChecksum());
        dto.setContentLine(recordDataToLine(record.getContent()));
        dto.setContentXml(recordDataToXml(record.getContent()));
        dto.setContentRaw(recordDataToRaw(record.getContent()));

        return dto;
    }

    public static List<HarvesterConfigDTO> harvesterListToDTO(List<TickleRepoHarvesterConfig> configs) {
        final List<HarvesterConfigDTO> dtos = new ArrayList<>();

        for (TickleRepoHarvesterConfig config : configs) {
            dtos.add(harvesterToDTO(config));
        }

        return dtos;
    }

    public static HarvesterConfigDTO harvesterToDTO(TickleRepoHarvesterConfig config) {
        final HarvesterConfigDTO dto = new HarvesterConfigDTO();

        dto.setName(config.getContent().getId());
        dto.setDataset(config.getContent().getDatasetName());
        dto.setId(config.getId());
        dto.setDestination(config.getContent().getDestination());

        return dto;
    }

    private static String recordDataToLine(byte[] content) {
        try {
            final MarcXchangeV1Reader reader = new MarcXchangeV1Reader(new ByteArrayInputStream(content), StandardCharsets.UTF_8);
            final MarcRecord record = reader.read();

            String rawLines = "";

            final Field field001 = record.getField(MarcRecord.hasTag("001")).get(); // All record formats should have field 001
            // Check if the record is marc21. If so use generic line format writer.
            // If not marc21 then Danmarc2 format is assumed and specific line format writer used
            if (field001 instanceof ControlField) {
                rawLines = new String(LINE_FORMAT_WRITER.write(record, StandardCharsets.UTF_8));

                // Replace all $<single char><value> with <space>$<single char><space><value>. E.g. $aThis is the value -> $a This is the value
                rawLines = rawLines.replaceAll("(\\$[aA0-zZ9|&])", " $1 ");
            } else {
                rawLines = new String(DANMARC_2_LINE_FORMAT_WRITER.write(record, StandardCharsets.UTF_8));

                // Replace all *<single char><value> with <space>*<single char><space><value>. E.g. *aThis is the value -> *a This is the value
                rawLines = rawLines.replaceAll("(\\*[aA0-zZ9|&])", " $1 ");

                // Replace double space with single space in front of subfield marker
                rawLines = rawLines.replaceAll(" {2}\\*", " \\*");
            }

            // If the previous line is exactly 82 chars long it will result in an blank line with 4 spaces, so we'll remove that
            rawLines = rawLines.replaceAll(" {4}\n", "");

            return rawLines;
        } catch (MarcWriterException | MarcReaderException | NullPointerException e) {
            return "";
        }
    }

    private static String recordDataToXml(byte[] content) {
        try {
            final String recordContent = new String(content, StandardCharsets.UTF_8);
            final Source xmlInput = new StreamSource(new StringReader(recordContent));
            final StringWriter stringWriter = new StringWriter();
            final StreamResult xmlOutput = new StreamResult(stringWriter);
            final TransformerFactory transformerFactory = TransformerFactory.newInstance();
            transformerFactory.setAttribute("indent-number", 4);
            final Transformer transformer = transformerFactory.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.transform(xmlInput, xmlOutput);

            return xmlOutput.getWriter().toString();
        } catch (TransformerException e) {
            return "";
        }
    }

    private static String recordDataToRaw(byte[] content) {
        return new String(content);
    }

}
