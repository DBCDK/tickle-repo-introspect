/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {Button, ButtonGroup, ToggleButtonGroup, ToggleButton} from "react-bootstrap";

class TickleRepoIntrospectRecordFormatSelector extends React.Component {

    constructor(props) {
        super(props);

        this.recordIdRef = React.createRef();
    }

    getStatusColor() {
        if( this.props.record == null ) {
            return '#666666';
        }
        return this.props.record.status == 'DELETED'
            ? '#ff0000'
            : '#008800';
    }

    render() {
        const format = this.props.format;

        return (
            <div>
                <div id='format-div'>
                    <ButtonGroup id='button-tool-bar-format'>
                        <Button onClick={this.props.handleChangeFormat}
                                bsStyle={format === 'LINE' ? 'primary' : 'default'}
                                id='button-format-line'
                                value='LINE'
                                disabled={!this.props.recordLoaded || this.props.record.contentLine == ''}>Linje</Button>
                        <Button onClick={this.props.handleChangeFormat}
                                bsStyle={format === 'XML' ? 'primary' : 'default'}
                                id='button-format-xml'
                                value='XML'
                                disabled={!this.props.recordLoaded || this.props.record.contentXml == ''}>Xml</Button>
                        <Button onClick={this.props.handleChangeFormat}
                                bsStyle={format === 'RAW' ? 'primary' : 'default'}
                                id='button-format-raw'
                                value='RAW'
                                disabled={!this.props.recordLoaded}>Rå</Button>
                    </ButtonGroup>
                    {
                        format == 'LINE' ?
                        <ToggleButtonGroup type="checkbox"
                                           onChange={this.props.handleShowBlanksChecked}
                                           style={{marginLeft: '30px'}}>
                            <ToggleButton value={'blanke'}
                                          bsStyle={this.props.showBlanks ? 'success' : 'default'}>
                                Vis blanktegn
                            </ToggleButton>
                        </ToggleButtonGroup>
                        : ''
                    }
                    <ButtonGroup id='button-tool-bar-format'
                                 style={{marginLeft: '50px'}}>
                        <input value={this.props.recordId != '' ? this.props.recordId : '(ikke valgt)'}
                               readOnly={true}
                               style={{
                                   color: this.getStatusColor(),
                                   marginRight: '4px'
                               }}/>
                    </ButtonGroup>
                    <Button onClick={this.props.handleAddToHarvest}
                            bsStyle={this.props.recordsToHarvest.includes(this.props.recordId) ? 'default' : 'primary'}
                            id='button-select'
                            value={this.props.recordId}
                            disabled={!this.props.recordLoaded}>Tilføj til høstning</Button>
                </div>
            </div>
        )
    }

}

export default TickleRepoIntrospectRecordFormatSelector;