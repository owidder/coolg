'use strict';

bottle.factory("pivot", function (container) {
    var funcs = bottle.container.funcs;
    var $datalib = bottle.container.$datalib;

    function Pivot(path) {
        var data = datalib.csv(path);
    }

    return {
        Pivot: Pivot
    }
});
