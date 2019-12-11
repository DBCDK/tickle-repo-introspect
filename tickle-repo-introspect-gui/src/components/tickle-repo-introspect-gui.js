/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {Tab, Tabs} from "react-bootstrap";
import queryString from 'query-string'

import TickleRepoIntrospectOverview from "./overview/tickle-repo-introspect-overview";
import TickleRepoIntrospectRecordViewer from "./view/tickle-repo-introspect-record-viewer";
import TickleRepoIntrospectRecordIdInput from "./tickle-repo-introspect-recordid-input";
import TickleRepoIntrospectHarvesting from "./harvest/tickle-repo-introspect-harvesting";
import * as Constants from './tickle-repo-introspect-constants';

import './tickle-repo-introspect.css';

const request = require('superagent');

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
            dataSetsForLocalId: [],
            inputMode: Constants.INPUT_MODE.LOCALID_WITH_LOOKUP,

            recordsToHarvest: [],
            showDeleteHarvestRecordsConfirmModal: false,
            selectedHarvester: -1,

            harvestingTextareaCols: 10,
            viewTextareaCols: 10
        };

        this.getInstance = this.getInstance.bind(this);
        this.getDatasets = this.getDatasets.bind(this);
        this.getDataSetsByLocalId = this.getDataSetsByLocalId.bind(this);
        this.setNewRecordId = this.setNewRecordId.bind(this);
        this.getRecordFromRecordId = this.getRecordFromRecordId.bind(this);

        this.clearHarvestList = this.clearHarvestList.bind(this);
        this.harvestRecords = this.harvestRecords.bind(this);

        this.handleTabSelect = this.handleTabSelect.bind(this);
        this.handleDataSetChange = this.handleDataSetChange.bind(this);
        this.handleLocalIdChange = this.handleLocalIdChange.bind(this);
        this.handleShowBlanksChecked = this.handleShowBlanksChecked.bind(this);
        this.handleResetLinkClicked = this.handleResetLinkClicked.bind(this);
        this.handleDatasetSelected = this.handleDatasetSelected.bind(this);
        this.handleEscapeKeyPress = this.handleEscapeKeyPress.bind(this);
        this.handleLocalIdKeyPress = this.handleLocalIdKeyPress.bind(this);

        this.handleChangeFormat = this.handleChangeFormat.bind(this);
        this.handleAddToHarvest = this.handleAddToHarvest.bind(this);

        this.setHarvestingTextareaCols = this.setHarvestingTextareaCols.bind(this);
        this.setViewTextareaCols = this.setViewTextareaCols.bind(this);
        this.setShowDeleteHarvestRecordsConfirmModal = this.setShowDeleteHarvestRecordsConfirmModal.bind(this);
        this.setSelectedHarvester = this.setSelectedHarvester.bind(this);

        this.localIdRef = React.createRef();
    }

    setHarvestingTextareaCols(cols) {
        console.log("harvesting " + cols);
        this.setState({harvestingTextareaCols: cols});
    }

    setViewTextareaCols(cols) {
        console.log("view " + cols);
        this.setState({viewTextareaCols: cols});
    }

    setSelectedHarvester(index) {
        this.setState({selectedHarvester: index});
    }

    setShowDeleteHarvestRecordsConfirmModal(show) {
        this.setState({showDeleteHarvestRecordsConfirmModal: show});
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

        // Fetch a list of defined datasets (sources)
        if (this.state.datasets === undefined) {
            // List can be empty, hence no default 'datasets' in state
            this.getDatasets();
        }

        // Fetch a list of defined tickle-harvester
        if (this.state.harvesters === undefined) {
            // List can be empty, hence no default 'harvesters' in state
            this.getHarvesters();
        }

        // Check for initial values from the querystring
        const queryParams = queryString.parse(location.search);
        let recordId = queryParams["recordId"] !== undefined ? queryParams["recordId"] : this.state.recordId;
        if( queryParams['tab'] === undefined || !["overblik", "visning", 'harvest'].includes(queryParams['tab']) ) {
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
        document.addEventListener("keydown", this.handleEscapeKeyPress, false);
    }

    componentWillUnmount(){
        document.removeEventListener("keydown", this.handleEscapeKeyPress, false);
    }

    redirectToUrlWithParams(tab, recordId) {
        let params = "?tab=" + tab + "&recordId=" + recordId
        if( history.replaceState ) {
            window.history.replaceState('', document.title, params);
        } else {
            location.search = params;
        }
    }

    handleEscapeKeyPress(event){
        if(event.keyCode === 27) {
            this.reset();
        }
    }

    handleLocalIdKeyPress(event){

        // Arrow up-down: Select a dataset when  multiple sets are available
        if(event.keyCode === 38 || event.keyCode === 40) { // up-down
            if( this.state.dataSetsForLocalId.length > 0 ) {
                let curr = this.state.dataSetsForLocalId.indexOf(this.state.dataSet);
                if( event.keyCode === 38 && curr > 0 ) {
                    this.setState({dataSet: this.state.dataSetsForLocalId[curr - 1]});
                    this.setNewRecordId(this.state.dataSet + ':' + this.state.localId);
                }
                if( event.keyCode === 40 && curr < this.state.dataSetsForLocalId.length - 1 ) {
                    this.setState({dataSet: this.state.dataSetsForLocalId[curr + 1]});
                    this.setNewRecordId(this.state.dataSet + ':' + this.state.localId);
                }
            }
        }

        // enter: Close select div for multiple datasets
        if(event.keyCode === 13) {
            this.setState({dataSetsForLocalId: []});
        }
    }

    handleTabSelect(view) {
        this.setState({view: view});
        this.redirectToUrlWithParams(view, this.state.recordId);
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
                inputMode: Constants.INPUT_MODE.DATASET_THEN_LOCALID
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
                inputMode: Constants.INPUT_MODE.LOCALID_WITH_LOOKUP
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
                inputMode: Constants.INPUT_MODE.DATASET_THEN_LOCALID,
                datasetForLocalId: []
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

            // Check for empty string, if found then just clear the screen and reset all modes
            if( event.target.value.length == 0 ) {
                this.setState({
                    dataSet: '',
                    localId: '',
                    inputMode: Constants.INPUT_MODE.LOCALID_WITH_LOOKUP,
                    dataSetsForLocalId: []
                });
                this.setNewRecordId(":");
            } else {
                if (this.state.inputMode == Constants.INPUT_MODE.LOCALID_WITH_LOOKUP) {
                    this.getDataSetsByLocalId(event.target.value);
                } else {
                    this.setNewRecordId(this.state.dataSet + ":" + event.target.value);
                }
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

    handleDatasetSelected(name) {
        this.setState({
            dataSet: name,
            dataSetsForLocalId: []
        })
    }

    handleAddToHarvest(event) {
        if( this.state.recordsToHarvest.includes(event.target.value)) {
            return;
        }
        let records = this.state.recordsToHarvest;
        records.push(event.target.value);
        this.setState({recordsToHarvest: records});
    }

    reset() {
        this.setState({
            record: null,
            recordLoaded: false,

            localId: '',
            dataSet: '',
            recordId: '',
            format: '',
            inputMode: Constants.INPUT_MODE.LOCALID_WITH_LOOKUP,
            dataSetsForLocalId: []
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
                        dataSet: dataSets[0].name,
                        dataSetsForLocalId: []
                    });
                    this.setNewRecordId(dataSets[0].name + ":" + localId);
                }

                // Scenario 2: More than one dataset matches the localid
                // - Select the dataset with the lowest agency id and view the matching record
                else if( dataSets.length > 1 ) {
                    dataSets.sort((a, b) => a.agencyId > b.agencyId ? 1 : -1);
                    this.setState({
                        dataSet: dataSets[0].name,
                        dataSetsForLocalId: dataSets.map(s => s.name)
                    });
                    this.setNewRecordId(dataSets[0].name + ":" + localId);
                }

                // Scenario 3: No datasets matches the localid
                // - Clear the dataset and the view (by viewing an nonexisting record)
                else {
                    this.setState({
                        dataSet: '',
                        dataSetsForLocalId: []
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

    getHarvesters() {
        request
            .get('/api/v1/harvesters')
            .set('Accepts', 'application/json')
            .then(res => {
                const harvesters = res.body.harvesters;
                this.setState({
                    harvesters: harvesters
                });
            })
            .catch(err => {
                alert(err.message);
            });
    }

    getBaseUrl() {
        let parts = window.location.toString().split("?");
        return parts.length > 0 ? parts[0] : window.location;
    }

    harvestRecords() {
        console.log("harvest " + this.state.selectedHarvester);
        if( this.state.selectedHarvester == -1 ) {
            return;
        }

        let harvester = this.state.harvesters[this.state.selectedHarvester];

        // Todo: Start a harvest
        console.log("Todo: harvest records with harvester '" + harvester.name + "'");

        // Clear the list
        this.setState({recordsToHarvest: []})
    }

    clearHarvestList() {
        this.setState({recordsToHarvest: []})
    }

    render() {
        return (
            <div style={{width: '100%', overflow: 'hidden'}}>
                <h2><a href={this.getBaseUrl()} onClick={this.handleResetLinkClicked}>Tickle Repo</a> <b>{this.state.instance}</b> - {this.state.datasets === undefined ? 0 : this.state.datasets.length} kilder</h2>
                <div style={{marginBottom: '60px'}}>
                    <TickleRepoIntrospectRecordIdInput dataSet={this.state.dataSet}
                                                       dataSetsForLocalId={this.state.dataSetsForLocalId}
                                                       localId={this.state.localId}
                                                       handleDatasetChange={this.handleDataSetChange}
                                                       handleLocalIdChange={this.handleLocalIdChange}
                                                       handle={this.handleLocalIdKeyPress}
                                                       localIdRef={this.localIdRef}
                                                       handleLocalIdKeyPress={this.handleLocalIdKeyPress}
                                                       handleDataSetChange={this.handleDataSetChange}
                                                       inputMode={this.state.inputMode}/>
                </div>
                <div>
                    <Tabs activeKey={this.state.view}
                          onSelect={this.handleTabSelect}
                          animation={false}
                          id="tabs">
                        <Tab eventKey={'overblik'} title="Overblik" style={{margin: '10px'}}>
                            <TickleRepoIntrospectOverview datasets={this.state.datasets}/>
                        </Tab>
                        <Tab eventKey={'visning'} title="Visning" style={{margin: '10px'}}>
                            <TickleRepoIntrospectRecordViewer record={this.state.record}
                                                recordId={this.state.recordId}
                                                recordLoaded={this.state.recordLoaded}
                                                format={this.state.format}
                                                handleChangeFormat={this.handleChangeFormat}
                                                showBlanks={this.state.showBlanks}
                                                handleShowBlanksChecked={this.handleShowBlanksChecked}
                                                isLineFormatSupported={this.state.isLineFormatSupported}
                                                isXmlFormatSupported={this.state.isXmlFormatSupported}
                                                recordsToHarvest={this.state.recordsToHarvest}
                                                handleAddToHarvest={this.handleAddToHarvest}
                                                textareaCols={this.state.viewTextareaCols}
                                                setTextareaCols={this.setViewTextareaCols}/>
                        </Tab>
                        <Tab eventKey={'harvest'} title="Høstning" style={{margin: '10px'}}>
                            <TickleRepoIntrospectHarvesting recordsToHarvest={this.state.recordsToHarvest}
                                                            harvestRecords={this.harvestRecords}
                                                            clearHarvestList={this.clearHarvestList}
                                                            harvesters={this.state.harvesters}
                                                            setSelectedHarvester={this.setSelectedHarvester}
                                                            textareaCols={this.state.harvestingTextareaCols}
                                                            setTextareaCols={this.setHarvestingTextareaCols}
                                                            showDeleteHarvestRecordsConfirmModal={this.state.showDeleteHarvestRecordsConfirmModal}
                                                            setShowDeleteHarvestRecordsConfirmModal={this.state.setShowDeleteHarvestRecordsConfirmModal}/>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }

}

export default TickleRepoIntrospectGUI;