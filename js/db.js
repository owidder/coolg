'use strict';

/* global bottle */
/* global PouchDB */

bottle.factory("db", function (container) {

    return new PouchDB('radar');
});
