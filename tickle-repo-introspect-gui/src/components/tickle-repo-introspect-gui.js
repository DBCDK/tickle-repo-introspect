/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {Tab, Tabs} from "react-bootstrap";
import DataSetSummaryList from "./tickle-repo-dataset-summary-list";
import TickleRecordViewer from "./tickle-repo-record-viewer";
import queryString from 'query-string'

const request = require('superagent');

const PID_WIDTH = 500;

class TickleIntrospectGUI extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            view: 'overblik',
            instance: '',
            pid: '',
            record: ''
        };

        this.getInstance = this.getInstance.bind(this);
        this.getDatasets = this.getDatasets.bind(this);
        this.handleTabSelect = this.handleTabSelect.bind(this);
        this.handlePidChange = this.handlePidChange.bind(this);
    }

    componentDidMount() {
        if (this.state.instance === '') {
            this.getInstance();
        }
        if (this.state.datasets === undefined) {
            // List can be empty, hence no default 'datasets' in state
            this.getDatasets();
        }

        // Extraxt url parameters
        const queryParams = queryString.parse(location.search);

        // Initially selected tab: "tab=[overblik|visning]"
        if( queryParams['tab'] !== undefined ) {
            if( ["overblik", "visning"].includes(queryParams['tab']) ) {
                this.setState({view: queryParams['tab']});
            } else {
                // Redirect to a sane tab id
                location.search = "?tab=overblik";
            }
        }

        // Pid for lookup in tab 'visning'
        if( queryParams["pid"] !== undefined ) {
            this.setState({pid: queryParams["pid"]});
            console.log("lookup " + queryParams["pid"]);
            this.getRecordFromPid(queryParams["pid"]);
        }
    }

    handleTabSelect(view) {
        this.setState({view: view});
    }

    handlePidChange(event) {
        this.setState({pid: event.target.value});
        this.getRecordFromPid(event.target.value);
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

    getRecordFromPid(pid) {
        let parts = pid.split(":");
        if( parts.length == 2 && parts[0].length > 0 && parts[1].length > 0 ) {
            request
                .get('/api/v1/record/' + pid)
                .set('Content-Type', 'text/plain')
                .then(res => {
                    if( !res.ok ) {
                        throw new Error(res.status);
                    }
                    this.setState({record: res.text});
                })
                .catch(err => {
                    if( err.status == 400 ) {
                        this.setState({record: ''});
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
                            <form onSubmit={this.handlePidSubmit}>
                                <label>
                                    Pid:
                                    <input type="text"
                                           value={this.state.pid}
                                           onChange={this.handlePidChange}
                                           style={{width: PID_WIDTH + 'px'}}/>
                                </label>&nbsp;
                            </form>
                            <TickleRecordViewer record={this.state.record}/>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }

}

export default TickleIntrospectGUI;