/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import RawrepoIntrospectRecordFormatSelector from './tickle-repo-introspect-record-format-selector';
import RawrepoIntrospectRecordCopy from './tickle-repo-introspect-record-copy';

const HEIGHT_OFFSET = 165;

class TickleRecordViewer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            textareaHeight: window.innerHeight - HEIGHT_OFFSET,
        };

        this.updateDimensions = this.updateDimensions.bind(this);
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
                                onChangeFormat={this.props.onChangeFormat}
                                recordLoaded={this.props.recordLoaded}/>
                        </div>
                        <div style={{marginLeft: '25px', float: 'left'}}>
                            <RawrepoIntrospectRecordCopy
                                onCopyToClipboard={this.props.onCopyToClipboard}
                                recordLoaded={this.props.recordLoaded}/>
                        </div>
                    </div>
                </div>
                <div className="flex-container">
                    <div id="content-container"
                         style={{
                             height: this.state.textareaHeight + 'px',
                             overflow:'auto',
                             border: 'solid 1px #999999'
                         }}>
                        <div id="content">
                            {this.props.record}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default TickleRecordViewer;