/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import RawrepoIntrospectRecordFormatSelector from './tickle-repo-introspect-record-format-selector';
import RawrepoIntrospectRecordCopy from './tickle-repo-introspect-record-copy';
import queryString from "query-string";

const HEIGHT_OFFSET = 210;
const PID_WIDTH = 500;

const request = require('superagent');

class TickleRecordViewer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            textareaHeight: window.innerHeight - HEIGHT_OFFSET,
            record: '',
            recordLoaded: false,
            pid: ''
        };

        this.updateDimensions = this.updateDimensions.bind(this);
        this.handlePidChange = this.handlePidChange.bind(this);
        this.getRecordFromPid = this.getRecordFromPid.bind(this);
    }

    updateDimensions() {
        this.setState({
            textareaHeight: window.innerHeight - HEIGHT_OFFSET,
        });
    };

    componentWillMount() {
        this.updateDimensions();
    };

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions);

        const queryParams = queryString.parse(location.search);
        if( queryParams["pid"] !== undefined ) {
            this.setState({pid: queryParams["pid"]});
            this.getRecordFromPid(queryParams["pid"]);
        }
    };

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }

    handlePidChange(event) {
        this.setState({pid: event.target.value});
        this.getRecordFromPid(event.target.value);
    }

    getRecordFromPid(pid) {
        let parts = pid.split(":");
        if( parts.length == 2 && parts[0].length > 0 && parts[1].length > 0 ) {
            request
                .get('/api/v1/record/' + pid)
                .set('Content-Type', 'text/plain')
                .then(res => {
                    if( !res.ok ) {
                        throw new Error(res.status);
                    }
                    this.setState({
                        record: res.text,
                        recordLoaded: true
                    });
                })
                .catch(err => {
                    if( err.status == 400 ) {
                        this.setState({
                            record: '',
                            recordLoaded: false
                        });
                    } else {
                        alert(err.message);
                    }
                });
        }
    }

    render() {
        return (

            <div>
                <div style={{width: '100%', overflow: 'hidden'}}>
                    <div className='form-group' style={{height: '28px'}}>
                        <label className={'pid-label'}
                               style={{marginLeft: '5px', marginRight: '20px', float: 'left'}}>
                            Pid&nbsp;
                            <input type="text"
                                   value={this.state.pid}
                                   onChange={this.handlePidChange}
                                   style={{width: PID_WIDTH + 'px'}}/>
                        </label>
                        <label
                            className='control-label'
                            style={{marginTop: '5px', float: 'left'}}
                            htmlFor='record-format-selector'>Visningsformat</label>
                        <div style={{marginLeft: '10px', float: 'left'}}>
                            <RawrepoIntrospectRecordFormatSelector
                                id='record-format-selector'
                                format={this.props.format}
                                onChangeFormat={this.props.onChangeFormat}
                                recordLoaded={this.state.recordLoaded}/>
                        </div>
                        <div style={{marginLeft: '25px', float: 'left'}}>
                            <RawrepoIntrospectRecordCopy
                                onCopyToClipboard={this.props.onCopyToClipboard}
                                recordLoaded={this.state.recordLoaded}/>
                        </div>
                    </div>
                </div>
                <div className="flex-container">
                    <div id="content-container"
                         style={{
                             height: this.state.textareaHeight + 'px',
                             overflow:'auto',
                             border: 'solid 1px #999999',
                             marginLeft: '5px'
                         }}>
                        <div id="content">
                            {this.state.record}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default TickleRecordViewer;