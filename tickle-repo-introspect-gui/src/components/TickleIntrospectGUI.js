/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {Tab, Tabs} from "react-bootstrap";

const request = require('superagent');

class TickleIntrospectGUI extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            view: 'overview',
            instance: ''
        };

        this.getInstance = this.getInstance.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount() {
        if (this.state.instance === '') {
            this.getInstance();
        }
        // Todo: not here
        if (this.state.datasets === '') {
            this.getDatasets();
        }
    }

    handleSelect(view) {

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
            .set('Content-Type', 'text/plain')
            .then(res => {
                const datasets = res.text;
                this.setState({
                    datasets: datasets
                });
                document.title = "Tickle Repo (" + datasets + ")";
            })
            .catch(err => {
                alert(err.message);
            });
    }

    render() {
        return (
            <div style={{width: '100%', overflow: 'hidden'}}>
                <div>
                    <h2>Tickle Repo <b>{this.state.instance}</b></h2>
                    // todo: not here
                    <h2>Datasets <b>{this.state.datasets}</b></h2>
                </div>
                <div>
                    <Tabs activeKey={this.state.view}
                          onSelect={this.handleSelect}
                          animation={false}
                          id="tabs">
                        <Tab eventKey={'overview'} title="Overblik">
                            Placeholder
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }

}

export default TickleIntrospectGUI;