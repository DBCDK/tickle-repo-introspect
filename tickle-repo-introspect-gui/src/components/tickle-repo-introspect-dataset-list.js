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
            <div className='dataset-list'
                 style={{
                     width: this.props.getWidthOfDataSetField(),
                     position: 'absolute',
                     top: '63px',
                     left: '159px',
                     display: 'inline-block',
                     visibility: this.props.dataSetsForLocalId.length > 0 ? 'visible' : 'hidden',
                 }}>
                 {
                     this.props.dataSetsForLocalId.map((name, index) =>
                     <div key={index}>
                        <a style={{fontWeight: this.props.dataSet == name ? 'bold' : 'normal'}}
                           onClick={() => { this.props.handleDataSetSelected(name)}}
                           key={index}
                           className={'dataset-list'}>{name}</a>
                     </div>)}
            </div>
        )
    }

}

export default TickleRepoIntrospectDataSetList;