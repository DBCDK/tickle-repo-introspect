/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {Tab, Tabs} from "react-bootstrap";
import DataSetSummaryList from "./DataSetSummaryList";
import queryString from 'query-string'

const request = require('superagent');

class TickleIntrospectGUI extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            view: 'overview',
            instance: ''
        };

        this.getInstance = this.getInstance.bind(this);
        this.getDatasets = this.getDatasets.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount() {
        if (this.state.instance === '') {
            this.getInstance();
        }
        if (this.state.datasets === undefined) {
            // List can be empty, hence no default 'datasets' in state
            this.getDatasets();
        }

        const queryParams = queryString.parse(location.search);
        if( queryParams['tab'] !== undefined ) {
            if( ["overblik"].includes(queryParams['tab']) ) {
                this.setState({view: queryParams['tab']});
            } else {
                // Redirect to a sane tab id
                location.search = "?tab=overblik";
            }
        }
    }

    handleSelect(view) {
        this.setState({view: view});
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

    render() {

        return (
            <div style={{width: '100%', overflow: 'hidden'}}>
                <div>
                    <h2>Tickle Repo <b>{this.state.instance}</b> - {this.state.datasets == undefined ? 0 : this.state.datasets.length} kilder</h2>
                </div>
                <div>
                    <Tabs activeKey={this.state.view}
                          onSelect={this.handleSelect}
                          animation={false}
                          id="tabs">
                        <Tab eventKey={'overblik'} title="Overblik">
                            <DataSetSummaryList datasets={this.state.datasets}/>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }

}

export default TickleIntrospectGUI;