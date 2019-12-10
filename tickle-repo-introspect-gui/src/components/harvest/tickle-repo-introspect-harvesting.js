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

        this.state = {
            textareaCols: this.availableRows()
        };

        this.updateDimensions = this.updateDimensions.bind(this);

        this.handleClearHarvestList = this.handleClearHarvestList.bind(this);
        this.handleRejectClearHarvestList = this.handleRejectClearHarvestList.bind(this);
        this.handleConfirmClearHarvestList = this.handleConfirmClearHarvestList.bind(this);
        this.handleBeginHarvest = this.handleBeginHarvest.bind(this);
    }

    updateDimensions() {
        this.setState({
            textareaCols: this.availableRows(),
            showConfirm: false
        });
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
        this.setState({showConfirm: true});
    }

    handleRejectClearHarvestList() {
        this.setState({showConfirm: false})
    }

    handleConfirmClearHarvestList() {
        this.setState({showConfirm: false})
        this.props.clearHarvestList();
    }

    handleBeginHarvest(event) {
        this.props.harvestRecords();
    }

    render() {
        return (
            <div>
                <div style={{width: '100%', overflow: 'hidden'}}>
                    <div className='form-group' style={{height: '28px'}}>
                        <div style={{float: 'left'}}>
                            <TickleRepoIntrospectDataioHarvesterSelector harvesters={this.props.harvesters}
                                                                         harvesterRef={this.props.harvesterRef}/>
                        </div>
                    </div>
                </div>
                <div className="flex-container">
                    <textarea value={this.props.recordsToHarvest.join("\n")}
                              readOnly={true}
                              style={{
                                  width: '100%',
                                  fontFamily: 'Courier New',
                                  fontSize: Constants.VIEW_FONT_SIZE + 'px',
                                  fontWeight: '500',
                                  lineHeight: Constants.HARVEST_LINE_HEIGHT + 'px',
                                  resize: 'none',
                                  backgroundColor: '#ffffff',
                                  color: this.props.textColor,
                                  border: 'solid 1px #aaaaaa',
                                  whiteSpace: 'pre',
                                  letterSpacing: '0px'
                              }}
                              rows={this.state.textareaCols}
                    />
                </div>
                <div style={{float: 'right'}}>
                    <Button onClick={this.handleClearHarvestList}
                            disabled={this.props.recordsToHarvest.length == 0}>
                        Tøm listen
                    </Button>
                    <Button onClick={this.handleBeginHarvest}
                            disabled={this.props.recordsToHarvest.length == 0}
                            bsStyle="primary">
                        Start høstning
                    </Button>
                </div>
                <Modal show={this.state.showConfirm} onHide={this.handleRejectClearHarvestList} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Tøm listen</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Er du sikker på at du vil slette alle record id'er i listen?</Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="primary" onClick={this.handleRejectClearHarvestList}>
                            Afbryd
                        </Button>
                        <Button bsStyle="secondary" onClick={this.handleConfirmClearHarvestList}>
                            Fortsæt
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default TickleRepoIntrospectHarvesting;