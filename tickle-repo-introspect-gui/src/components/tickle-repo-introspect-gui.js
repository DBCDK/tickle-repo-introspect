/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {Tab, Tabs} from "react-bootstrap";
import queryString from 'query-string';

import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

import TickleRepoIntrospectOverview from "./overview/tickle-repo-introspect-overview";
import TickleRepoIntrospectRecordViewer from "./view/tickle-repo-introspect-record-viewer";
import TickleRepoIntrospectRecordIdInput from "./tickle-repo-introspect-recordid-input";
import TickleRepoIntrospectHarvesting from "./harvest/tickle-repo-introspect-harvesting";
import * as Constants from './tickle-repo-introspect-constants';

const request = require('superagent');

const color = { red: '#ff0000',
                green: '#00ff00',
                yellow: '#ffd700',
                white: '#ffffff' };

class TickleRepoIntrospectGUI extends React.Component {

    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            view: 'overblik',
            instance: '',

            record: null,
            recordLoaded: false,

            datasets: [],
            dataSet: '',
            localId: '',
            recordId: '',
            format: '',
            showBlanks: false,
            dataSetsForLocalId: [],
            inputMode: Constants.INPUT_MODE.LOCALID_WITH_LOOKUP,

            submitter: props.cookies.get('submitter') || '',
            datasetIds: [],
            submitterColor: color.white,

            recordsToHarvest: [],
            showDeleteHarvestRecordsConfirmModal: false,
            showHarvestRecordsConfirmModal: false,
            selectedHarvester: -1,

            harvestingTextareaCols: 10,
            viewTextareaCols: 10
        };

        this.getInstance = this.getInstance.bind(this);
        this.getDatasets = this.getDatasets.bind(this);
        this.getDataSetsByLocalId = this.getDataSetsByLocalId.bind(this);
        this.setNewRecordId = this.setNewRecordId.bind(this);
        this.getRecordFromRecordId = this.getRecordFromRecordId.bind(this);

        this.handleTabSelect = this.handleTabSelect.bind(this);
        this.handleDataSetChange = this.handleDataSetChange.bind(this);
        this.handleLocalIdChange = this.handleLocalIdChange.bind(this);
        this.handleShowBlanksChecked = this.handleShowBlanksChecked.bind(this);
        this.handleResetLinkClicked = this.handleResetLinkClicked.bind(this);
        this.handleDataSetSelected = this.handleDataSetSelected.bind(this);
        this.handleEscapeKeyPress = this.handleEscapeKeyPress.bind(this);
        this.handleLocalIdKeyPress = this.handleLocalIdKeyPress.bind(this);
        this.handleChangeFormat = this.handleChangeFormat.bind(this);
        this.handleSubmitterChange = this.handleSubmitterChange.bind(this);

        this.setHarvestingTextareaCols = this.setHarvestingTextareaCols.bind(this);
        this.setViewTextareaCols = this.setViewTextareaCols.bind(this);
        this.setShowDeleteHarvestRecordsConfirmModal = this.setShowDeleteHarvestRecordsConfirmModal.bind(this);
        this.setShowHarvestRecordsConfirmModal = this.setShowHarvestRecordsConfirmModal.bind(this);
        this.setSelectedHarvester = this.setSelectedHarvester.bind(this);
        this.clearHarvestList = this.clearHarvestList.bind(this);
        this.harvestRecords = this.harvestRecords.bind(this);
        this.addToHarvest = this.addToHarvest.bind(this);

        this.localIdRef = React.createRef();
    }

    setHarvestingTextareaCols(cols) {
        this.setState({harvestingTextareaCols: cols});
    }

    setViewTextareaCols(cols) {
        this.setState({viewTextareaCols: cols});
    }

    setSelectedHarvester(index) {
        this.setState({selectedHarvester: index});
    }

    setShowDeleteHarvestRecordsConfirmModal(show) {
        this.setState({showDeleteHarvestRecordsConfirmModal: show});
    }

    setShowHarvestRecordsConfirmModal(show) {
        this.setState({showHarvestRecordsConfirmModal: show});
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
        this.redirectToUrlWithParams("visning", recordId, this.state.submitter);
    }

    componentDidMount() {
        if (this.state.instance === '') {
            this.getInstance();
        }

        // Fetch a list of defined tickle-harvester
        if (this.state.harvesters === undefined) {
            // List can be empty, hence no default 'harvesters' in state
            this.getHarvesters();
        }

        // Check for initial values from the querystring
        const queryParams = queryString.parse(location.search);
        let recordId = queryParams["recordId"] !== undefined ? queryParams["recordId"] : this.state.recordId;
        let submitter = queryParams["submitter"] !== undefined ? queryParams["submitter"] : this.state.submitter;
        if( queryParams['tab'] === undefined || !["overblik", "visning", 'harvest'].includes(queryParams['tab']) ) {
            this.redirectToUrlWithParams('overblik', recordId, submitter);
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

        // If we have an initial submitter, fetch dataset summery
        if( submitter != '' ) {
            this.setState({
                submitter: submitter
            })
            this.getDatasetIds(submitter);
        }

        // Add event listener for the escape key (clear dataset/localid)
        document.addEventListener("keydown", this.handleEscapeKeyPress, false);
    }

    componentWillUnmount(){
        document.removeEventListener("keydown", this.handleEscapeKeyPress, false);
    }

    redirectToUrlWithParams(tab, recordId, submitter) {
        let params = "?tab=" + tab + "&recordId=" + recordId + "&submitter=" + submitter
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
                    this.setNewRecordId(this.state.dataSetsForLocalId[curr - 1] + ':' + this.state.localId);
                }
                if( event.keyCode === 40 && curr < this.state.dataSetsForLocalId.length - 1 ) {
                    this.setState({dataSet: this.state.dataSetsForLocalId[curr + 1]});
                    this.setNewRecordId(this.state.dataSetsForLocalId[curr + 1] + ':' + this.state.localId);
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
        this.redirectToUrlWithParams(view, this.state.recordId, this.state.submitter);
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

    handleDataSetSelected(name) {
        this.setState({
            dataSet: name,
            dataSetsForLocalId: []
        });
        this.setNewRecordId(name + ':' + this.state.localId);
    }

    handleSubmitterChange(event) {
        let value = event.target.value.replace(/\D/g,'');
        this.setState({
            submitter: value,
            submitterColor: color.white
        });

        if( value.length != 6 ) {
            this.setState( {
                datasets: [],
                dataSetIds: []
            });
            return;
        } else {
            this.setState( {
                view: 'overblik'
            });
        }

        this.props.cookies.set('submitter', value);
        this.getDatasetIds(value);
    }

    addToHarvest(records) {
        let recordsToHarvest = this.state.recordsToHarvest;
        records.forEach( (record) => {
            record = record.trim();
            if( record.length > 0 && !recordsToHarvest.includes(record) ) {
                if( record.split(':').length == 2 ) {
                    recordsToHarvest.push(record);
                }
            }
        });
        this.setState({recordsToHarvest: recordsToHarvest});
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
        this.redirectToUrlWithParams(this.state.view, '', this.state.submitter);
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

    getDatasetIds(submitter) {

        this.setState({
            submitterColor: color.yellow
        });

        request
            .get('/api/v1/datasets/' + submitter)
            .set('Accepts', 'application/json')
            .then(res => {
                const datasetIds = res.body.datasets;
                this.setState({
                    datasetIds: datasetIds
                });

                for( var i = 0; i < datasetIds.length; i++ ) {
                    this.getDatasets(datasetIds[i].id);
                }

                this.setState({
                    submitterColor: datasetIds.length > 0 ? color.green : color.white
                });
            })
            .catch(err => {
                this.setState({
                    submitterColor: color.red
                });
                alert(err.message);
            });
    }

    getDatasets(id) {
        request
            .get('/api/v1/datasets/summary/' + id)
            .set('Accepts', 'application/json')
            .then(res => {
                const summary = res.body;
                let datasets = this.state.datasets;
                datasets.push(summary);
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
                    harvesters: harvesters,
                    selectedHarvester: harvesters.length > 0 ? 0 : -1
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
        if( this.state.selectedHarvester == -1 ) {
            return;
        }

        // Select the set of records to harvest with the selected harvester
        let harvester = this.state.harvesters[this.state.selectedHarvester];
        let records = this.state.recordsToHarvest.filter((record) => {
            return record.split(":")[0] == harvester.dataset;
        });

        // Compose request
        let req =
        {
            requests: [
                {
                    harvesterid: harvester.id,
                    recordIds: records
                }
            ]
        };

        // Send the harvest request.
        // If the request succeeds, then remove those recordids that have been added to the harvest request.
        // We always, only, send a request for a single harvester so we know that if we have a
        // request in the response dto, then its the current request - we dont need to check the harvester id.
        request
            .post('/api/v1/harvesters/request')
            .set('Content-Type', 'application/json')
            .send(req)
            .then(res => {
                if( res.body.requests.length > 0 ) {
                    let remaining = this.state.recordsToHarvest.filter((record) => {
                        return !res.body.requests[0].recordIds.includes(record);
                    });
                    this.setState({recordsToHarvest: remaining});
                }
            })
            .catch(err => {
                alert(err.message);
            });
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
                                                       handleDataSetChange={this.handleDataSetChange}
                                                       handleLocalIdChange={this.handleLocalIdChange}
                                                       handle={this.handleLocalIdKeyPress}
                                                       localIdRef={this.localIdRef}
                                                       handleLocalIdKeyPress={this.handleLocalIdKeyPress}
                                                       handleDataSetSelected={this.handleDataSetSelected}
                                                       inputMode={this.state.inputMode}
                                                       handleSubmitterChange={this.handleSubmitterChange}
                                                       submitter={this.state.submitter}
                                                       submitterColor={this.state.submitterColor}/>
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
                                                addToHarvest={this.addToHarvest}
                                                textareaCols={this.state.viewTextareaCols}
                                                setTextareaCols={this.setViewTextareaCols}/>
                        </Tab>
                        <Tab eventKey={'harvest'} title="Høstning" style={{margin: '10px'}}>
                            <TickleRepoIntrospectHarvesting recordsToHarvest={this.state.recordsToHarvest}
                                                            harvestRecords={this.harvestRecords}
                                                            clearHarvestList={this.clearHarvestList}
                                                            harvesters={this.state.harvesters}
                                                            setSelectedHarvester={this.setSelectedHarvester}
                                                            selectedHarvester={this.state.selectedHarvester}
                                                            textareaCols={this.state.harvestingTextareaCols}
                                                            setTextareaCols={this.setHarvestingTextareaCols}
                                                            showDeleteHarvestRecordsConfirmModal={this.state.showDeleteHarvestRecordsConfirmModal}
                                                            setShowDeleteHarvestRecordsConfirmModal={this.setShowDeleteHarvestRecordsConfirmModal}
                                                            showHarvestRecordsConfirmModal={this.state.showHarvestRecordsConfirmModal}
                                                            setShowHarvestRecordsConfirmModal={this.setShowHarvestRecordsConfirmModal}
                                                            addToHarvest={this.addToHarvest}/>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }

}
export default withCookies(TickleRepoIntrospectGUI);
