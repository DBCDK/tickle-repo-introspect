/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";

import TickleRepoIntrospectRecordFormatSelector from './tickle-repo-introspect-record-format-selector';
import { dateFormatter } from '../tickle-repo-introspect-date-formatter'
import * as Constants from '../tickle-repo-introspect-constants';

class TickleRepoIntrospectRecordViewer extends React.Component {

    constructor(props) {
        super(props);

        this.updateDimensions = this.updateDimensions.bind(this);
    }

    updateDimensions() {
        this.props.setTextareaCols(this.availableRows());
    };

    availableRows() {
        let availableHeight = Math.round((window.innerHeight - Constants.VIEW_HEIGHT_OFFSET) / Constants.VIEW_LINE_HEIGHT);
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

    getRecordForSelectedFormat() {
        if( this.props.record == null ) {
            return '';
        }
        switch (this.props.format) {
            case 'LINE':
                return this.props.showBlanks ? this.props.record.contentLine.replace(/ /g, '_') : this.props.record.contentLine;
            case 'XML':
                return this.props.record.contentXml;
            default:
                return this.props.record.contentRaw;
        }
    }

    render() {
        return (
            <div>
                <div style={{width: '100%', overflow: 'hidden'}}>
                    <div style={{height: '28px'}}>
                        <div style={{float: 'left'}}>
                            <TickleRepoIntrospectRecordFormatSelector
                                id='record-format-selector'
                                format={this.props.format}
                                record={this.props.record}
                                recordId={this.props.recordId}
                                handleChangeFormat={this.props.handleChangeFormat}
                                recordLoaded={this.props.recordLoaded}
                                showBlanks={this.props.showBlanks}
                                handleShowBlanksChecked={this.props.handleShowBlanksChecked}
                                isLineFormatSupported={this.props.isLineFormatSupported}
                                isXmlFormatSupported={this.props.isXmlFormatSupported}
                                recordsToHarvest={this.props.recordsToHarvest}
                                handleAddToHarvest={this.props.handleAddToHarvest}/>
                        </div>
                    </div>
                </div>
                {
                    this.props.record != null ?
                    <div>
                        Created: <b>{dateFormatter(this.props.record.timeOfCreation)}</b>
                        &nbsp; &nbsp;
                        Modified: <b>{dateFormatter(this.props.record.timeOfLastModification)}</b>
                        &nbsp; &nbsp;
                        Sidste batch: <b>{this.props.record.batch}</b>
                        &nbsp; &nbsp;
                        Tracking ID: <b>{this.props.record.trackingId}</b>
                    </div>
                    : ''
                }
                <div>
                    <textarea value={ this.getRecordForSelectedFormat() }
                              readOnly={true}
                              className='record-viewer'
                              style={{letterSpacing: this.props.showBlanks && this.props.format == 'LINE' ? '2px' : '0px'}}
                              rows={this.props.textareaCols}
                    />
                </div>
            </div>
        )
    }

}

export default TickleRepoIntrospectRecordViewer;