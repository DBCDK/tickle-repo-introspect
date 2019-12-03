/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";

class DataSetSummaryList extends React.Component {

    constructor(props) {
        super(props);

        this.dateFormatter = this.dateFormatter.bind(this);
    }

    dateFormatter(cell) {
        // Todo: temporary fix to get dates to parse. Will most likely be fixed in the API
        let dateValue = new Date(cell);

        // Used for making date and time segments two chars long.
        let leftPad2 = function (val) {
            return ("00" + val).slice(-2)
        };

        return dateValue.getFullYear() +
            '-' + leftPad2(dateValue.getMonth() + 1) +
            '-' + leftPad2(dateValue.getDate()) +
            ' ' + leftPad2(dateValue.getHours()) +
            ':' + leftPad2(dateValue.getMinutes()) +
            ':' + leftPad2(dateValue.getSeconds());
    };

    render() {
        return (
            <div>
                <BootstrapTable data={this.props.datasets}
                                striped={true}
                                options={{noDataText: 'Indlæser...'}}
                                bodyStyle={{overflow: 'overlay'}}>
                    <TableHeaderColumn dataField='name'
                                       isKey
                                       dataSort
                                       width='100'>Navn</TableHeaderColumn>
                    <TableHeaderColumn dataField='sum'
                                       dataSort
                                       width='100'>Sum</TableHeaderColumn>
                    <TableHeaderColumn dataField='active'
                                       dataSort
                                       width='90'>Aktive</TableHeaderColumn>
                    <TableHeaderColumn dataField='deleted'
                                       dataSort
                                       width='90'>Slettede</TableHeaderColumn>
                    <TableHeaderColumn dataField='reset'
                                       dataSort
                                       width='90'>Under omkørsel</TableHeaderColumn>
                    <TableHeaderColumn dataField='timeOfLastModification'
                                       dataSort
                                       dataFormat={this.dateFormatter}
                                       width='160'>Modificeret</TableHeaderColumn>
                    <TableHeaderColumn dataField='batchId'
                                       dataSort
                                       width='90'>Batch id</TableHeaderColumn>
                </BootstrapTable>
            </div>
        )
    }

}

export default DataSetSummaryList;