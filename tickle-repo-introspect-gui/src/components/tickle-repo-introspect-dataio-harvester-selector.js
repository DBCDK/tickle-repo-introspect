/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {Button, ButtonGroup, ToggleButtonGroup, ToggleButton} from "react-bootstrap";

class TickleRepoIntrospectDataioHarvesterSelector extends React.Component {

    constructor(props) {
        super(props);

        this.recordIdRef = React.createRef();
    }

    render() {
        const format = this.props.format;

        return (
            <div>
                <select>
                    <option value={'abc'}>ABC</option>
                    <option value={'def'}>DEF</option>
                </select>

            </div>
        )
    }

}

export default TickleRepoIntrospectDataioHarvesterSelector;