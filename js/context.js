'use strict';

/* global bottle */

bottle.factory("context", function (container) {

    return {
        serverPath: "http://localhost:3000",
        radarId: 1,
        tenantId: 1
    };
});
