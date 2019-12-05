/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import TickleRepoIntrospectDataSetList from "./tickle-repo-introspect-dataset-list";
import * as Constants from './tickle-repo-introspect-constants';

class TickleRepoIntrospectRecordIdInput extends React.Component {

    constructor(props) {
        super(props);

        this.getWidthOfDataSetField = this.getWidthOfDataSetField.bind(this);
    }

    getWidthOfDataSetField() {
        if( this.props.dataSet.length < 10 ) {
            return 10 * Constants.FONT_WIDTH_FACTOR;
        }

        if( this.props.dataSetsForLocalId.length > 1 ) {
            return Math.max(...this.props.dataSetsForLocalId.map(name => name.length)) * Constants.FONT_WIDTH_FACTOR;
        } else {
            return this.props.dataSet.length * Constants.FONT_WIDTH_FACTOR
        }
    }

    getWidthOfLocalidField() {
        if( this.props.localId.length < 10 ) {
            return 10 * Constants.FONT_WIDTH_FACTOR;
        }

        return this.props.localId.length * Constants.FONT_WIDTH_FACTOR
    }

    getLocalIdColor() {
        return this.props.inputMode == Constants.INPUT_MODE.LOCALID_WITH_LOOKUP
            ? '#000000'
            : '#00aa00'
    }

    render() {
        return(
            <div>
            <label className={'recordId-label'}
                   style={{marginLeft: '5px', marginRight: '20px', float: 'left'}}>
                <input type="text"
                       value={this.props.dataSet}
                       onChange={this.props.handleDataSetChange}
                       style={{
                           width: this.getWidthOfDataSetField(),
                           fontFamily: 'Courier New',
                           fontSize: Constants.FONT_SIZE + 'px',
                           color: this.getLocalIdColor()
                       }}
                       placeholder={'data sæt'}/>
                &nbsp;:&nbsp;
                <input type="text"
                       value={this.props.localId}
                       onChange={this.props.handleLocalIdChange}
                       style={{
                           width: this.getWidthOfLocalidField(),
                           fontFamily: 'Courier New',
                           fontSize: Constants.FONT_SIZE + 'px'
                       }}
                       autoFocus
                       ref={this.props.localIdRef}
                       placeholder={'lokal id'}
                       onKeyDown={this.props.handleLocalIdKeyPress}/>
            </label>
            <div style={{
                paddingTop: '5px',
                fontSize: 'smaller'
            }}>
                <u>escape</u>: Nulstil siden
                &nbsp; &nbsp;
                <u>pil op/ned</u>: Vælg datasæt
                &nbsp; &nbsp;
                <u>enter</u>: Vælg og luk datasætvælger
            </div>
            <TickleRepoIntrospectDataSetList dataSetsForLocalId={this.props.dataSetsForLocalId}
                                             dataSet={this.props.dataSet}
                                             getWidthOfDataSetField={this.getWidthOfDataSetField}/>
            </div>
        );
    }

}

export default TickleRepoIntrospectRecordIdInput;