/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {Tab, Tabs} from "react-bootstrap";
import DataSetSummaryList from "./DataSetSummaryList";
import TickleRecordViewer from "./TickleRecordViewer";
import queryString from 'query-string'

const request = require('superagent');

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
        this.handlePidSubmit = this.handlePidSubmit.bind(this);
    }

    componentDidMount() {
        if (this.state.instance === '') {
            this.getInstance();
        }
        if (this.state.datasets === undefined) {
            // List can be empty, hence no default 'datasets' in state
            this.getDatasets();
        }
        if (this.state.pid !== '' ) {
            this.getRecordFromPid(this.state.pid);
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
            this.getRecordFromPid(this.state.pid);
        }
    }

    handleTabSelect(view) {
        this.setState({view: view});
    }

    handlePidChange(event) {
        this.setState({pid: event.target.value});
    }

    handlePidSubmit(event) {
        this.getRecordFromPid(this.state.pid)
        event.preventDefault();
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

        // Only request a record if we have a valid localid and dataset
        let parts = pid.split(":");
        if( parts.length == 2 && parts[0].length > 0 && parts[1].length > 0 ) {
            request
                .get('/api/v1/record/' + pid)
                .set('Accepts', 'application/json')
                .then(res => {
                    this.setState({record: res.text});
                })
                .catch(err => {
                    alert(err.message);
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
                                    Pid: <input type="text" value={this.state.pid} onChange={this.handlePidChange} />
                                </label>&nbsp;
                                <input type="submit" value="Hent post"/>
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