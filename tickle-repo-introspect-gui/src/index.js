/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

const React = require("react");
const ReactDOM = require("react-dom");

import {CookiesProvider, useCookies} from 'react-cookie';

import TickleRepoIntrospectGUI from './components/tickle-repo-introspect-gui';

ReactDOM.render(
    <CookiesProvider>
        <TickleRepoIntrospectGUI/>
    </CookiesProvider>,
    document.getElementById('root')
);

//export default withCookies(App);