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
    }

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