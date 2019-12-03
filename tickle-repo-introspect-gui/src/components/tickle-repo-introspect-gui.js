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
const FONT_SIZE = 14;
const FONT_WIDTH_FACTOR = 10; // This is somewhat unprecise, adjust to fit the font in use

const INPUT_MODE = Object.freeze({
    DATASET_THEN_LOCALID: 1,
    LOCALID_WITH_LOOKUP:  2
});

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
            recordIdWidth: 0,
            dataSetsForLocalId: [],
            inputMode: INPUT_MODE.LOCALID_WITH_LOOKUP
        };

        this.getInstance = this.getInstance.bind(this);
        this.getDatasets = this.getDatasets.bind(this);
        this.getDataSetsByLocalId = this.getDataSetsByLocalId.bind(this);
        this.setNewRecordId = this.setNewRecordId.bind(this);
        this.getRecordFromRecordId = this.getRecordFromRecordId.bind(this);

        this.handleTabSelect = this.handleTabSelect.bind(this);
        this.handleDataSetChange = this.handleDataSetChange.bind(this);
        this.handleLocalIdChange = this.handleLocalIdChange.bind(this);
        this.handleChangeFormat = this.handleChangeFormat.bind(this);
        this.handleShowBlanksChecked = this.handleShowBlanksChecked.bind(this);
        this.handleResetLinkClicked = this.handleResetLinkClicked.bind(this);

        this.resetByEscapePress = this.resetByEscapePress.bind(this);

        this.localIdRef = React.createRef();
    }

    resetByEscapePress(event){
        if(event.keyCode === 27) {
            this.reset();
        }
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

        // Add event listener for the escape key (clear dataset/localid)
        document.addEventListener("keydown", this.resetByEscapePress, false);
    }

    componentWillUnmount(){
        document.removeEventListener("keydown", this.resetByEscapePress, false);
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

        // Scenario 1: We have a string with a colon, this is a complete dataset:localid = recordid
        // - Move the localid name to the local id field
        // - Lookup this record id (assuming its valid, otherwise the view becomes empty
        // - Change inputmode so that no lookups is made when the local id changes
        // - Change focus to the local id field
        if( parts.length == 2 ) {
            this.setState({
                dataSet: parts[0],
                localId: parts[1],
                inputMode: INPUT_MODE.DATASET_THEN_LOCALID
            });
            this.setNewRecordId(parts[0] + ":" + parts[1]);
            this.localIdRef.current.focus();
        }

        // Scenario 2: We have a value which is (part of) a dataset name
        // Combine the value with the current value of the local id field and lookup this record
        else if( event.target.value.length > 0) {
            this.setState({dataSet: event.target.value});
            this.setNewRecordId(event.target.value + ":" + this.state.localId);
        }

        // Scenario 3: The field is empty
        // - Clear the view (by looking up a non-existing record)
        // - Change inputmode so that dataset lookup is performed when changing the local id
        // - Change focus to the local id field
        else {
            this.setState({
                dataSet: '',
                inputMode: INPUT_MODE.LOCALID_WITH_LOOKUP
            });
            this.setNewRecordId(event.target.value + ":" + this.state.localId);
            this.localIdRef.current.focus();
        }
    }

    handleLocalIdChange(event) {
        let parts = event.target.value.split(":");

        // Scenario 1: We have a string with a colon, this is a complete dataset:localid = recordid
        // - Move the dataset name to the dataset field
        // - Lookup this record
        // - Change inputmode so no dataset lookups is made when the local id changes
        if( parts.length == 2 ) {
            this.setState({
                dataSet: parts[0],
                localId: parts[1],
                inputMode: INPUT_MODE.DATASET_THEN_LOCALID
            });
            this.setNewRecordId(parts[0] + ":" + parts[1]);
        }

        // Scenario 2: String (possibly empty) with a local id
        // - If inputmode enables dataset lookup then:
        //   - Lookup datasets for this localid (implicitly views the record, if it exists)
        //   else:
        //   - View the record but DO NOT lookup datasets
        else {
            this.setState({localId: event.target.value});

            if( this.state.inputMode == INPUT_MODE.LOCALID_WITH_LOOKUP ) {
                this.getDataSetsByLocalId(event.target.value);
            } else {
                this.setNewRecordId(this.state.dataSet + ":" + event.target.value);
            }
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
        this.reset();

        if( this.state.view == 'visning' ) {
            event.preventDefault();
        }
    }

    reset() {
        this.setState({
            localId: '',
            dataSet: '',
            recordId: '',
            recordIdWidth: 0,
            record: null,
            format: '',
            recordLoaded: false,
            inputMode: INPUT_MODE.LOCALID_WITH_LOOKUP
        });

        this.localIdRef.current.focus();
        this.redirectToUrlWithParams(this.state.view, '');
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

    getDataSetsByLocalId(localId) {
        if( localId.length == 0) {
            return;
        }
        request
            .get('/api/v1/datasets/by-local-id/' + localId)
            .set('Accepts', 'application/json')
            .then(res => {
                let dataSets = res.body.datasets !== undefined ? res.body.datasets : [];

                // Scenario 1: Exactly one dataset matches the localid
                // - Select this dataset and view the matching record
                if( dataSets.length == 1 ) {
                    this.setState({
                        dataSet: dataSets[0].name
                    });
                    this.setNewRecordId(dataSets[0].name + ":" + localId);
                }

                // Scenario 2: More than one dataset matches the localid
                // - Select the dataset with the lowest agency id and view the matching record
                // - Todo: show that more dataset matches and make is possible to select another
                else if( dataSets.length > 1 ) {
                    dataSets.sort((a, b) => a.agencyId > b.agencyId ? 1 : -1);
                    this.setState({
                        dataSet: dataSets[0].name
                    });
                    this.setNewRecordId(dataSets[0].name + ":" + localId);
                    // Todo: indicate somehow that more more datasets is available
                }

                // Scenario 3: No datasets matches the localid
                // - Clear the dataset and the view (by viewing an nonexisting record)
                else {
                    this.setState({
                        dataSet: ''
                    });
                    this.setNewRecordId('');
                }
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
        } else {
            this.setState({
                record: null,
                recordLoaded: false,
                recordId: ''
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
                                   color: this.state.inputMode == INPUT_MODE.LOCALID_WITH_LOOKUP ? '#000000' : '#00aa00'
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
                               ref={this.localIdRef}
                               placeholder={'lokal id'}/>
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
                                                isXmlFormatSupported={this.state.isXmlFormatSupported}/>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }

}

export default TickleRepoIntrospectGUI;