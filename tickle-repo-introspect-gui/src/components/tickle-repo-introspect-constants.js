/*
 * Copyright Dansk Bibliotekscenter a/s. Licensed under GNU GPL v3
 * See license text at https://opensource.dbc.dk/licenses/gpl-3.0
 */

import React from "react";

export const HARVEST_HEIGHT_OFFSET = 450;
export const HARVEST_LINE_HEIGHT = 22;
export const VIEW_HEIGHT_OFFSET = 280;
export const VIEW_LINE_HEIGHT = 22;
export const FONT_SIZE = 14;
export const FONT_WIDTH_FACTOR = 10; // This is somewhat unprecise, adjust to fit the font in use

export const INPUT_MODE = Object.freeze({
    DATASET_THEN_LOCALID: 1,
    LOCALID_WITH_LOOKUP:  2
});
