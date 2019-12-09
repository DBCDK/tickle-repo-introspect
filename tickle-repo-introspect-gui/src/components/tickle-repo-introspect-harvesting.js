/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";
import * as Constants from './tickle-repo-introspect-constants';
import TickleRepoIntrospectDataioHarvesterSelector from "./tickle-repo-introspect-dataio-harvester-selector";

class TickleRepoIntrospectHarvesting extends React.Component {

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

    render() {
        return (
            <div>
                <div style={{width: '100%', overflow: 'hidden'}}>
                    <div className='form-group' style={{height: '28px'}}>
                        <div style={{float: 'left'}}>
                            <TickleRepoIntrospectDataioHarvesterSelector/>
                        </div>
                    </div>
                </div>
                <div className="flex-container">
                    <textarea value=''
                              readOnly={true}
                              style={{
                                  width: '100%',
                                  fontFamily: 'Courier New',
                                  fontSize: Constants.VIEW_FONT_SIZE + 'px',
                                  fontWeight: '500',
                                  lineHeight: Constants.VIEW_LINE_HEIGHT + 'px',
                                  resize: 'none',
                                  backgroundColor: '#ffffff',
                                  color: this.props.textColor,
                                  border: 'solid 1px #aaaaaa',
                                  whiteSpace: 'pre',
                                  letterSpacing: '0px'
                              }}
                              rows={this.state.textareaCols}
                    />
                </div>
                <div style={{float: 'right'}}>
                    <button>Start høstning</button>
                </div>
            </div>
        );
    }
}

export default TickleRepoIntrospectHarvesting;