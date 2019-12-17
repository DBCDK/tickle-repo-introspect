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
                                 onChange={this.handleOnChange}
                                 style={{backgroundColor: this.props.harvesters !== undefined && this.props.selectedHarvester >= 0
                                         ? (this.props.harvesters[this.props.selectedHarvester].enabled ? '#00ff00' : '#ff0000')
                                         : '#ffffff'}}>
                        {
                            (this.props.harvesters !== undefined ? this.props.harvesters : []).map((harvester, index) =>
                            <option key={index} value={index}>
                                {harvester.name + " (" + harvester.dataset + " ==> " + harvester.destination + ")" + (harvester.enabled ? "" : "  DISABLED")}
                            </option>)
                        }
                    </FormControl>
                </FormGroup>
            </div>
        )
    }

}

export default TickleRepoIntrospectDataioHarvesterSelector;