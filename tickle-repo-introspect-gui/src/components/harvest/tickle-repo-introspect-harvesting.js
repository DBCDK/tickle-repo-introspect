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
                <div>
                    // Todo: textarea must handle direct input as well (and paste'd content)
                    <textarea value={this.props.recordsToHarvest.join("\n")}
                              class='record-harvesting'
                              readOnly={true}
                              rows={this.state.textareaCols}
                    />
                </div>
                <div style={{width: '100%', overflow: 'hidden', marginTop: '4px'}}>
                    <div className='form-group' style={{height: '28px'}}>
                        <Button onClick={this.handleClearHarvestList}
                                disabled={this.props.recordsToHarvest.length == 0}
                                style={{float: 'right'}}>
                            Tøm listen
                        </Button>
                        <Button onClick={this.handleBeginHarvest}
                                disabled={this.props.recordsToHarvest.length == 0}
                                style={{marginLeft: '4px', marginRight: '20px', float: 'right'}}
                                bsStyle="primary">
                            Start høstning
                        </Button>
                        <div style={{float: 'right'}}>
                            <TickleRepoIntrospectDataioHarvesterSelector harvesters={this.props.harvesters}
                                                                         harvesterRef={this.props.harvesterRef}/>
                        </div>
                    </div>
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