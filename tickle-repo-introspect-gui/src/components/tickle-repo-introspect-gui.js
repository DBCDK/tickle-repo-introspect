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
            recordId: '',
            format: 'best',
            showBlanks: false,
            isLineFormatSupported: true,
            isXmlFormatSupported: true
        };

        this.getInstance = this.getInstance.bind(this);
        this.getDatasets = this.getDatasets.bind(this);
        this.getRecordFromRecordId = this.getRecordFromRecordId.bind(this);

        this.handleTabSelect = this.handleTabSelect.bind(this);
        this.handleRecordIdChange = this.handleRecordIdChange.bind(this);
        this.handleChangeFormat = this.handleChangeFormat.bind(this);
        this.handleShowBlanksChecked = this.handleShowBlanksChecked.bind(this);
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
        if( queryParams['tab'] === undefined || !["overblik", "visning"].includes(queryParams['tab']) ) {
            this.redirectToUrlWithParams('overblik');
        } else {
            this.setState({view: queryParams["tab"]});
        }
        let recordId = queryParams["recordId"] !== undefined ? queryParams["recordId"] : this.state.recordId;
        let format = queryParams["format"] !== undefined ? queryParams["format"] : this.state.format;
        this.setState({
            recordId: recordId,
            format: format
        })
        this.getRecordFromRecordId(recordId, format);
    }

    redirectToUrlWithParams(tab, format, recordId) {
        let params = "?tab=" + tab + "&format=" + format + "&recordId=" + recordId
        if( history.replaceState ) {
            window.history.replaceState('', document.title, params);
        } else {
            location.search = params;
        }
    }

    handleTabSelect(view) {
        this.setState({view: view});
        this.redirectToUrlWithParams(view, this.state.format, this.state.recordId);
    }

    handleRecordIdChange(event) {
        this.setState({
            recordId: event.target.value,
            format: "best"
        });
        this.getRecordFromRecordId(event.target.value, "best");
        this.setState({view: 'visning'});
        this.redirectToUrlWithParams("visning", 'best', event.target.value);
    }

    handleChangeFormat(event) {
        const format = event.target.value;
        this.setState({format: format});
        this.getRecordFromRecordId(this.state.recordId, format);
        this.redirectToUrlWithParams(this.state.view, format, this.state.recordId);
    }

    handleShowBlanksChecked(event) {
        this.setState({showBlanks: !this.state.showBlanks});
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

    isLineFormat(body) {

        // Heuristics: If the body starts with a tag-begin, is absolutely not lineformat
        if( body.startsWith("<") ) {
            return false;
        }

        // Could be marcxchange (m21) or just raw text, check for known pattern '001 xxxx...'
        let lines = body.split("\n");
        for( var i = 0; i < lines.length; i++ ) {
            if( lines[i].startsWith("001 ") ) {
                return true;
            }
        }

        // Properbly not marcxchange
        return false;
    }

    isXmlFormat(body) {

        // Heuristics: Expect any type of xml to begin with a tag-begin '<'
        return body.startsWith("<");
    }

    getRecordFromRecordId(recordId, format) {
        let parts = recordId.split(":");
        if( parts.length == 2 && parts[0].length > 0 && parts[1].length > 0 ) {
            let query = recordId + (format == "best" ? "" : "?format=" + format);

            request
                .get('/api/v1/records/' + query)
                .set('Content-Type', 'text/plain')
                .then(res => {
                    if( !res.ok ) {
                        throw new Error(res.status);
                    }
                    this.setState({
                        record: res.text,
                        recordLoaded: true,
                    });
                    if( format == 'best' ) {
                        this.setState({
                            isLineFormatSupported: this.isLineFormat(res.text),
                            isXmlFormatSupported: this.isLineFormat(res.text) || this.isXmlFormat(res.text)
                        })
                    } else {
                        if( format == 'LINE' && !this.isLineFormat(res.text) ) {
                            this.setState({
                                format: "best",
                                isLineFormatSupported: false,
                                isXmlFormatSupported: this.isXmlFormat(res.text)
                            })
                        }
                        if( format == 'XML' && !(this.isLineFormat(res.text) || this.isXmlFormat(res.text)) ) {
                            this.setState({
                                format: "best",
                                isLineFormatSupported: false,
                                isXmlFormatSupported: false
                            })
                        }
                    }
                })
                .catch(err => {
                    if( err.status == 400 ) {

                    } else {
                        alert(err.message);
                    }
                    this.setState({
                        record: '',
                        recordLoaded: false
                    });
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
                               onChange={this.handleRecordIdChange}
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
                                                recordLoaded={this.state.recordLoaded}
                                                format={this.state.format}
                                                handleChangeFormat={this.handleChangeFormat}
                                                textColor='#000000'
                                                showBlanks={this.state.showBlanks}
                                                handleShowBlanksChecked={this.handleShowBlanksChecked}
                                                isLineFormatSupported={this.state.isLineFormatSupported}
                                                isXmlFormatSupported={this.state.isXmlFormatSupported}/>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }

}

export default TickleRepoIntrospectGUI;