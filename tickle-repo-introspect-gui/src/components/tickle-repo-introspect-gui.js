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
const LOCALID_WIDTH = 100;
const DATASET_WIDTH = 300;
const FONT_WIDTH_FACTOR = 10; // This is somewhat unprecise, adjust to fit the font in use
const FONT_SIZE = 14;

class TickleRepoIntrospectGUI extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            view: 'overblik',
            instance: '',
            record: null,
            recordLoaded: false,
            dataSet: '',
            localId: '',
            recordId: '',
            format: '',
            showBlanks: false,
            recordIdWidth: 0
        };

        this.getInstance = this.getInstance.bind(this);
        this.getDatasets = this.getDatasets.bind(this);
        this.setNewRecordId = this.setNewRecordId.bind(this);
        this.getRecordFromRecordId = this.getRecordFromRecordId.bind(this);

        this.handleTabSelect = this.handleTabSelect.bind(this);
        this.handleDataSetChange = this.handleDataSetChange.bind(this);
        this.handleLocalIdChange = this.handleLocalIdChange.bind(this);
        this.handleChangeFormat = this.handleChangeFormat.bind(this);
        this.handleShowBlanksChecked = this.handleShowBlanksChecked.bind(this);
        this.handleResetLinkClicked = this.handleResetLinkClicked.bind(this);

        this.localIdRef = React.createRef();
    }

    setInitialTab(tab) {
        this.setState({view: tab});
    }

    setNewRecordId(recordId) {
        this.setState({
            format: '',
            view: 'visning'
        });
        this.getRecordFromRecordId(recordId);
        this.redirectToUrlWithParams("visning", recordId);
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
        let recordId = queryParams["recordId"] !== undefined ? queryParams["recordId"] : this.state.recordId;
        if( queryParams['tab'] === undefined || !["overblik", "visning"].includes(queryParams['tab']) ) {
            this.redirectToUrlWithParams('overblik', recordId);
        } else {
            this.setInitialTab(queryParams["tab"], recordId);
        }
        this.getRecordFromRecordId(recordId);

        // If we have an initial recordid, fill out the dataset and localid fields
        if( recordId != '' ) {
            let parts = recordId.split(":");
            if( parts.length == 2) {
                this.setState({
                    dataSet: parts[0],
                    localId: parts[1]
                });
            }
        }
    }

    redirectToUrlWithParams(tab, recordId) {
        let params = "?tab=" + tab + "&recordId=" + recordId
        if( history.replaceState ) {
            window.history.replaceState('', document.title, params);
        } else {
            location.search = params;
        }
    }

    handleTabSelect(view) {
        this.setState({view: view});
        this.redirectToUrlWithParams(view);
    }

    handleDataSetChange(event) {
        let parts = event.target.value.split(":");
        if( parts.length == 2 ) {
            this.setState({
                dataSet: parts[0],
                localId: parts[1]
            });
            this.setNewRecordId(parts[0] + ":" + parts[1]);
            this.localIdRef.current.focus();
        } else {
            this.setState({dataSet: event.target.value});
            this.setNewRecordId(event.target.value + ":" + this.state.localId);
        }
    }

    handleLocalIdChange(event) {
        let parts = event.target.value.split(":");
        if( parts.length == 2 ) {
            this.setState({
                dataSet: parts[0],
                localId: parts[1]
            });
            this.setNewRecordId(parts[0] + ":" + parts[1]);
        } else {
            this.setState({localId: event.target.value});
            this.setNewRecordId(this.state.dataSet + ":" + event.target.value);
        }
    }

    handleChangeFormat(event) {
        const format = event.target.value;
        this.setState({format: format});
        this.getRecordFromRecordId(this.state.recordId);
    }

    handleShowBlanksChecked(event) {
        this.setState({showBlanks: !this.state.showBlanks});
    }

    handleResetLinkClicked(event) {
        this.setState({
            localId: '',
            dataSet: '',
            recordId: '',
            recordIdWidth: 0,
            record: null,
            format: '',
            recordLoaded: false
        });

        this.redirectToUrlWithParams(this.state.view, '');

        if( this.state.view == 'visning' ) {
            event.preventDefault();
            this.localIdRef.current.focus();
        }
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

    getRecordFromRecordId(recordId) {
        let parts = recordId.split(":");
        if( parts.length == 2 && parts[0].length > 0 && parts[1].length > 0 ) {
            let query = recordId;

            request
                .get('/api/v1/records/' + query)
                .set('Content-Type', 'text/plain')
                .then(res => {

                    // Error check
                    if( !res.ok ) {
                        throw new Error(res.status);
                    }

                    // If the record is not found, we get an empty message back
                    if( res.text == '' ) {
                        this.setState({
                            record: null,
                            recordLoaded: false,
                            recordId: ''
                        });
                        return;
                    }

                    // Select format, if none is set
                    let format = this.state.format;
                    if( format == '' ) {
                        if( res.body.contentLine != '' ) {
                            format = 'LINE';
                        } else if( res.body.contentXml != '' ) {
                            format = 'XML';
                        } else {
                            format = 'RAW';
                        }
                    }

                    // Record exists
                    this.setState({
                        record: res.body,
                        recordLoaded: true,
                        recordId: recordId,
                        format: format
                    });
                })
                .catch(err => {
                    alert(err.message);
                    this.setState({
                        record: '',
                        recordLoaded: false,
                        recordId: ''
                    });
                });
        }
    }

    getBaseUrl() {
        let parts = window.location.toString().split("?");
        return parts.length > 0 ? parts[0] : window.location;
    }

    render() {
        return (
            <div style={{width: '100%', overflow: 'hidden'}}>
                <div>
                    <label className={'recordId-label'}
                           style={{marginLeft: '5px', marginRight: '20px', float: 'left'}}>
                        <input type="text"
                               value={this.state.dataSet}
                               onChange={this.handleDataSetChange}
                               style={{
                                   width: this.state.dataSet.length < 10
                                       ? 10 * FONT_WIDTH_FACTOR
                                       : this.state.dataSet.length * FONT_WIDTH_FACTOR,
                                   fontFamily: 'Courier New',
                                   fontSize: FONT_SIZE + 'px',
                               }}/>
                               &nbsp;:&nbsp;
                        <input type="text"
                               value={this.state.localId}
                               onChange={this.handleLocalIdChange}
                               style={{
                                   width: this.state.localId.length < 10
                                   ? 10 * FONT_WIDTH_FACTOR
                                   : this.state.localId.length * FONT_WIDTH_FACTOR,
                                   fontFamily: 'Courier New',
                                   fontSize: FONT_SIZE + 'px'
                               }}
                               autoFocus
                               ref={this.localIdRef}/>
                    </label>
                    <h2><a href={this.getBaseUrl()} onClick={this.handleResetLinkClicked}>Tickle Repo</a> <b>{this.state.instance}</b> - {this.state.datasets == undefined ? 0 : this.state.datasets.length} kilder</h2>
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
                                                recordId={this.state.recordId}
                                                recordLoaded={this.state.recordLoaded}
                                                format={this.state.format}
                                                handleChangeFormat={this.handleChangeFormat}
                                                textColor='#000000'
                                                showBlanks={this.state.showBlanks}
                                                handleShowBlanksChecked={this.handleShowBlanksChecked}
                                                isLineFormatSupported={this.state.isLineFormatSupported}
                                                isXmlFormatSupported={this.state.isXmlFormatSupported}
                                                recordIdWidth={this.state.recordIdWidth}/>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }

}

export default TickleRepoIntrospectGUI;