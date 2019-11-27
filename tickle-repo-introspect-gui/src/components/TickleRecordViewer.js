/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";

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
        )
    }

}

export default TickleRecordViewer;