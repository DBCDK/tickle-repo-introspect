/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import {FormGroup, FormControl} from "react-bootstrap";

class TickleRepoIntrospectDataioHarvesterSelector extends React.Component {

    constructor(props) {
        super(props);

        this.handleOnChange = this.handleOnChange.bind(this);
    }

    handleOnChange(event) {
        this.props.setSelectedHarvester(event.target.value);
    }

    render() {

        return (
            <div>
                <FormGroup controlId="formControlsSelect">
                    <FormControl componentClass="select"
                                 placeholder="select"
                                 onChange={this.handleOnChange}>
                        {(this.props.harvesters !== undefined ? this.props.harvesters : []).map((harvester, index) =>
                        <option key={index} value={index}>{harvester.name + " (" + harvester.dataset + " ==> " + harvester.destination + ")"}</option>)}
                    </FormControl>
                </FormGroup>
            </div>
        )
    }

}

export default TickleRepoIntrospectDataioHarvesterSelector;