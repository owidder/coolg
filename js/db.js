'use strict';

/* global PouchDB */

bottle.factory("db", function (container) {

    return new PouchDB('radar');
});
