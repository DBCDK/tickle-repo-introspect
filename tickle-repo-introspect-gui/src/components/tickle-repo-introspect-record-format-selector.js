/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {Button, ButtonGroup} from "react-bootstrap";

class TickleRepoIntrospectRecordFormatSelector extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const format = this.props.format;

        return (
            <div>
                <div id='format-div'>
                    <ButtonGroup id='button-tool-bar-format'>
                        <Button onClick={this.props.handleChangeFormat}
                                bsStyle={format === 'best' ? 'primary' : 'default'}
                                style={{marginRight: '10px'}}
                                id='button-format-best'
                                value='best'
                                disabled={!this.props.recordLoaded}>Bedste</Button>
                        <Button onClick={this.props.handleChangeFormat}
                                bsStyle={format === 'LINE' ? 'primary' : 'default'}
                                id='button-format-line'
                                value='LINE'
                                disabled={!this.props.recordLoaded}>Linje</Button>
                        <Button onClick={this.props.handleChangeFormat}
                                bsStyle={format === 'XML' ? 'primary' : 'default'}
                                id='button-format-xml'
                                value='XML'
                                disabled={!this.props.recordLoaded}>XML</Button>
                    </ButtonGroup>
                </div>
            </div>
        )
    }

}

export default TickleRepoIntrospectRecordFormatSelector;