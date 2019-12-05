/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import * as Constants from './tickle-repo-introspect-constants';

class TickleRepoIntrospectRecordIdInput extends React.Component {

    constructor(props) {
        super(props);
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
                           color: this.props.inputMode == Constants.INPUT_MODE.LOCALID_WITH_LOOKUP ? '#000000' : '#00aa00'
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
                        border: 'solid 2px #bbbbbb',
                        borderRadius: '3px',
                        width: this.getWidthOfDataSetField(),
                        position: 'fixed',
                        top: '62px',
                        left: '5px',
                        visibility: this.props.dataSetsForLocalId.length > 0 ? 'visible' : 'hidden',
                        display:'block',
                        zIndex:'2',
                        paddingLeft: '3px',
                        paddingTop: '5px',
                        backgroundColor: 'rgba(255, 255, 255, 1)'
                }}>
                    {this.props.dataSetsForLocalId.map((name, index) =>
                        <div key={index}>
                            <a style={{
                                   marginRight: '10px',
                                   marginLeft: '5px',
                                   fontWeight: this.props.dataSet == name ? 'bold' : 'normal',
                                   cursor: 'pointer',
                                   fontFamily: 'Courier New',
                                   fontSize: Constants.FONT_SIZE + 'px',
                                color: '#333333'
                               }}
                               onClick={() => { this.handleDatasetSelected(name)}}
                            key={index}>{name}</a>
                        </div>)}
                </div>
            </div>
        );
    }

}

export default TickleRepoIntrospectRecordIdInput;