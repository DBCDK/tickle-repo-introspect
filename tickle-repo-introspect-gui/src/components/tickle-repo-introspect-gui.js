/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {Tab, Tabs} from "react-bootstrap";
import DataSetSummaryList from "./tickle-repo-introspect-dataset-summary-list";
import TickleRecordViewer from "./tickle-repo-introspect-record-viewer";
import queryString from 'query-string'

const request = require('superagent');
const RECORDID_WIDTH = 500;

class TickleRepoIntrospectGUI extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            view: 'overblik',
            instance: '',
            record: '',
            recordLoaded: false,
            recordId: ''
        };

        this.getInstance = this.getInstance.bind(this);
        this.getDatasets = this.getDatasets.bind(this);
        this.getRecordFromrecordId = this.getRecordFromrecordId.bind(this);

        this.handleTabSelect = this.handleTabSelect.bind(this);
        this.handlerecordIdChange = this.handlerecordIdChange.bind(this);
    }

    componentDidMount() {
        if (this.state.instance === '') {
            this.getInstance();
        }
        if (this.state.datasets === undefined) {
            // List can be empty, hence no default 'datasets' in state
            this.getDatasets();
        }

        // Check for initial values from the querystring
        const queryParams = queryString.parse(location.search);
        if( queryParams['tab'] !== undefined ) {
            if( ["overblik", "visning"].includes(queryParams['tab']) ) {
                this.setState({view: queryParams['tab']});
            } else {
                // Redirect to a sane tab id
                location.search = "?tab=overblik";
            }
        }
        if( queryParams["recordId"] !== undefined ) {
            this.setState({recordId: queryParams["recordId"]});
            this.getRecordFromrecordId(queryParams["recordId"]);
        }
    }

    handleTabSelect(view) {
        this.setState({view: view});
    }

    handlerecordIdChange(event) {
        this.setState({recordId: event.target.value});
        this.getRecordFromrecordId(event.target.value);
    }

    getInstance() {
        request
            .get('/api/v1/instance')
            .set('Content-Type', 'text/plain')
            .then(res => {
                const instance = res.text;
                this.setState({
                    instance: instance
                });
                document.title = "Tickle Repo (" + instance + ")";
            })
            .catch(err => {
                alert(err.message);
            });
    }

    getDatasets() {
        request
            .get('/api/v1/datasets')
            .set('Accepts', 'application/json')
            .then(res => {
                const datasets = res.body.dataSets;
                this.setState({
                    datasets: datasets
                });
            })
            .catch(err => {
                alert(err.message);
            });
    }

    getRecordFromrecordId(recordId) {
        let parts = recordId.split(":");
        if( parts.length == 2 && parts[0].length > 0 && parts[1].length > 0 ) {
            request
                .get('/api/v1/record/' + recordId)
                .set('Content-Type', 'text/plain')
                .then(res => {
                    if( !res.ok ) {
                        throw new Error(res.status);
                    }
                    this.setState({
                        record: res.text,
                        recordLoaded: true
                    });
                })
                .catch(err => {
                    if( err.status == 400 ) {
                        this.setState({
                            record: '',
                            recordLoaded: false
                        });
                    } else {
                        alert(err.message);
                    }
                });
        }
    }

    render() {
        return (
            <div style={{width: '100%', overflow: 'hidden'}}>
                <div>
                    <label className={'recordId-label'}
                           style={{marginLeft: '5px', marginRight: '20px', float: 'left'}}>
                        <input type="text"
                               value={this.state.recordId}
                               onChange={this.handlerecordIdChange}
                               style={{width: RECORDID_WIDTH + 'px'}}/>
                    </label>
                    <h2>Tickle Repo <b>{this.state.instance}</b> - {this.state.datasets == undefined ? 0 : this.state.datasets.length} kilder</h2>
                </div>
                <div>
                    <Tabs activeKey={this.state.view}
                          onSelect={this.handleTabSelect}
                          animation={false}
                          id="tabs">
                        <Tab eventKey={'overblik'} title="Overblik" style={{margin: '10px'}}>
                            <DataSetSummaryList datasets={this.state.datasets}/>
                        </Tab>
                        <Tab eventKey={'visning'} title="Visning" style={{margin: '10px'}}>
                            <TickleRecordViewer record={this.state.record}
                                                recordLoaded={this.state.recordLoaded}/>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }

}

export default TickleRepoIntrospectGUI;