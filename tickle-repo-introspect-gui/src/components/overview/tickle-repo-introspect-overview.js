/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";

import { dateFormatter } from '../tickle-repo-introspect-date-formatter'

class TickleRepoIntrospectOverview extends React.Component {

    constructor(props) {
        super(props);

        this.getCurrentSubmitterDatasets = this.getCurrentSubmitterDatasets.bind(this);
    }

    getCurrentSubmitterDatasets() {
        return this.props.datasets
            .filter( dataset => {
                return dataset.name.substring(0, 6) == this.props.submitter;
            });
    }

    render() {
        let datasets = this.getCurrentSubmitterDatasets();
        return (
            <div>
                {
                    datasets.length > 0
                        ? <span>Summeret overblik for submitter <b>{this.props.submitter}</b> med <b>{datasets.length}</b> datasæt.</span>
                        : ''
                }
                <BootstrapTable data={datasets}
                                striped={true}
                                options={{noDataText: 'Indtast submitter id...'}}
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
                                       dataFormat={dateFormatter}
                                       width='160'>Modificeret</TableHeaderColumn>
                    <TableHeaderColumn dataField='batchId'
                                       dataSort
                                       width='90'>Batch id</TableHeaderColumn>
                </BootstrapTable>
            </div>
        )
    }

}

export default TickleRepoIntrospectOverview;