/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import * as Constants from './tickle-repo-introspect-constants';

class TickleRepoIntrospectDataSetList extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{
                     border: 'solid 2px #bbbbbb',
                     borderRadius: '3px',
                     width: this.props.getWidthOfDataSetField(),
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
                 {
                     this.props.dataSetsForLocalId.map((name, index) =>
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
        )
    }

}

export default TickleRepoIntrospectDataSetList;