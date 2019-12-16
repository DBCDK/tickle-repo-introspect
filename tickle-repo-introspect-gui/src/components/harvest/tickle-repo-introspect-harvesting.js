/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {Button, Modal} from "react-bootstrap";

import * as Constants from '../tickle-repo-introspect-constants';
import TickleRepoIntrospectDataioHarvesterSelector from "./tickle-repo-introspect-dataio-harvester-selector";

class TickleRepoIntrospectHarvesting extends React.Component {

    constructor(props) {
        super(props);

        this.updateDimensions = this.updateDimensions.bind(this);

        this.handleClearHarvestList = this.handleClearHarvestList.bind(this);
        this.handleRejectClearHarvestList = this.handleRejectClearHarvestList.bind(this);
        this.handleConfirmClearHarvestList = this.handleConfirmClearHarvestList.bind(this);
        this.handleBeginHarvest = this.handleBeginHarvest.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handlePaste = this.handlePaste.bind(this);

        this.updateDimensions = this.updateDimensions.bind(this);

        this.recordIdRef = React.createRef();
    }

    updateDimensions() {
        this.props.setTextareaCols(this.availableRows());
    };

    availableRows() {
        let availableHeight = Math.round((window.innerHeight - Constants.HARVEST_HEIGHT_OFFSET) / Constants.HARVEST_LINE_HEIGHT);
        return availableHeight < 3 ? 3 : availableHeight;
    }

    componentWillMount() {
        this.updateDimensions();
    };

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions);
    };

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }

    handleClearHarvestList(event) {
        this.props.setShowDeleteHarvestRecordsConfirmModal(true);
    }

    handleRejectClearHarvestList() {
        this.props.setShowDeleteHarvestRecordsConfirmModal(false);
    }

    handleConfirmClearHarvestList() {
        this.props.setShowDeleteHarvestRecordsConfirmModal(false);
        this.props.clearHarvestList();
    }

    handleBeginHarvest(event) {
        this.props.harvestRecords();
    }

    handleClick() {
        this.props.addToHarvest([this.recordIdRef.current.value]);
        this.recordIdRef.current.value = "";
    }

    handlePaste(event) {
        let parts = event.clipboardData.getData('Text')
            .replace(/[;, ]/g,'\n')
            .split('\n');
        this.recordIdRef.current.value = "";
        this.props.addToHarvest(parts.filter((record) => { return record.trim() != ''}));
        event.preventDefault();
    }

    getRecordsForHarvester(included) {
        if( this.props.selectedHarvester >= 0 ) {
            return this.props.recordsToHarvest.filter((record) => {
                let result = record.split(":")[0] == this.props.harvesters[this.props.selectedHarvester].dataset;
                return included ? result : !result;
            });
        } else {
            return [];
        }
    }

    render() {
        return (
            <div>
                <div style={{marginBottom: '5px'}}>
                    <input style={{width: '500px', position:'relative', top:'1px'}}
                           ref={this.recordIdRef}
                           onPaste={this.handlePaste}
                    />
                    &nbsp;
                    <Button onClick={this.handleClick}>Add</Button>
                </div>
                <div>
                    <textarea className='record-harvesting'
                              rows={5}
                              readOnly
                              value={this.getRecordsForHarvester(false).join(', ')}
                              style={{backgroundColor: '#cccccc', cursor: 'crosshair', color: '#aa0000'}}
                              onPaste={this.handlePaste}
                              placeholder={'Poster der IKKE kan høstes med den valgte høster'}
                    />
                </div>
                <div>
                    <textarea className='record-harvesting'
                              rows={this.props.textareaCols}
                              readOnly
                              value={this.getRecordsForHarvester(true).join('\n')}
                              style={{backgroundColor: '#eeeeee', cursor: 'crosshair ', color: '#00aa00'}}
                              onPaste={this.handlePaste}
                              placeholder={"Poster der kan høstes med den valgte høster"}
                    />
                </div>
                <div style={{width: '100%', overflow: 'hidden', marginTop: '4px'}}>
                    <div className='form-group' style={{height: '28px'}}>
                        <Button onClick={this.handleClearHarvestList}
                                disabled={this.props.recordsToHarvest.length == 0}
                                style={{float: 'right'}}>
                            Tøm listen
                        </Button>
                        <div style={{float: 'left'}}>
                            <TickleRepoIntrospectDataioHarvesterSelector harvesters={this.props.harvesters}
                                                                         setSelectedHarvester={this.props.setSelectedHarvester}/>
                        </div>
                        <Button onClick={this.handleBeginHarvest}
                                disabled={this.props.recordsToHarvest.length == 0}
                                style={{marginLeft: '4px', marginRight: '40px', float: 'left'}}
                                variant="primary">
                            Start høstning
                        </Button>
                    </div>
                </div>
                <Modal show={this.props.showDeleteHarvestRecordsConfirmModal} onHide={this.handleRejectClearHarvestList} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Tøm listen</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Er du sikker på at du vil slette alle record id'er i listen?</Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleRejectClearHarvestList}>
                            Afbryd
                        </Button>
                        <Button onClick={this.handleConfirmClearHarvestList}>
                            Fortsæt
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default TickleRepoIntrospectHarvesting;