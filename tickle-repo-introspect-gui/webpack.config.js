/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

const packageJSON = require('./package.json');
const path = require('path');

const PATHS = {
    build: path.join(__dirname, 'target', 'classes', 'META-INF', 'resources', 'webjars', packageJSON.name, packageJSON.version)
};

module.exports = {
    entry: './src/index.js',

    output: {
        path: PATHS.build,
        publicPath: "/",
        filename: 'app-bundle.js'
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader'],
                exclude: /node_modules/
            }
        ]
    },
    devServer: {
        hot: true,
        port: 8090,
        proxy: [
            {
                context: ['/api'],
                target: 'http://localhost:8080'
            }
        ]
    }
};
