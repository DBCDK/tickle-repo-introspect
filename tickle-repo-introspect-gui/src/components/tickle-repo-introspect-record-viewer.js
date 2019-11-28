/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import RawrepoIntrospectRecordFormatSelector from './tickle-repo-introspect-record-format-selector';
import queryString from "query-string";

const HEIGHT_OFFSET = 190;
const LINE_HEIGHT = 22;
const FONT_SIZE = 14;
const request = require('superagent');

class TickleRepoIntrospectRecordViewer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            textareaCols: this.availableRows()
        };

        this.updateDimensions = this.updateDimensions.bind(this);
    }

    updateDimensions() {
        this.setState({
            textareaCols: this.availableRows()
        });
    };

    availableRows() {
        let availableHeight = Math.round((window.innerHeight - HEIGHT_OFFSET) / LINE_HEIGHT);
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

    render() {
        return (

            <div>
                <div style={{width: '100%', overflow: 'hidden'}}>
                    <div className='form-group' style={{height: '28px'}}>

                        <label
                            className='control-label'
                            style={{marginTop: '5px', float: 'left'}}
                            htmlFor='record-format-selector'>Visningsformat</label>
                        <div style={{marginLeft: '10px', float: 'left'}}>
                            <RawrepoIntrospectRecordFormatSelector
                                id='record-format-selector'
                                format={this.props.format}
                                handleChangeFormat={this.props.handleChangeFormat}
                                recordLoaded={this.props.recordLoaded}/>
                        </div>
                    </div>
                </div>
                <div className="flex-container">
                    <textarea value={this.props.record}
                              readOnly={true}
                              style={{
                                  width: '100%',
                                  fontFamily: 'Courier New',
                                  fontSize: FONT_SIZE + 'px',
                                  fontWeight: '500',
                                  lineHeight: LINE_HEIGHT + 'px',
                                  resize: 'none',
                                  backgroundColor: '#ffffff',
                                  color: this.props.textColor,
                                  border: 'solid 1px #aaaaaa',
                                  whiteSpace: 'pre'
                              }}
                              rows={this.state.textareaCols}
                    />
                </div>
            </div>
        )
    }

}

export default TickleRepoIntrospectRecordViewer;