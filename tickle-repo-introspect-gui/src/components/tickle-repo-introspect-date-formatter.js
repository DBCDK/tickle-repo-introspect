/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";

export function dateFormatter(epoch) {
    let dateValue = new Date(epoch);

    // Used for making date and time segments two chars long.
    let leftPad2 = function (val) {
        return ("00" + val).slice(-2)
    };

    return dateValue.getFullYear() +
        '-' + leftPad2(dateValue.getMonth() + 1) +
        '-' + leftPad2(dateValue.getDate()) +
        ' ' + leftPad2(dateValue.getHours()) +
        ':' + leftPad2(dateValue.getMinutes()) +
        ':' + leftPad2(dateValue.getSeconds());
};
