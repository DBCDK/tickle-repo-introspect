/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";

class TickleRecordViewer extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div>
                { this.props.record }
            </div>
        )

    }

}

export default TickleRecordViewer;