'use strict';

bottle.factory("pivot", function (container) {
    var funcs = bottle.container.funcs;
    var $datalib = bottle.container.$datalib;

    function Pivot(path) {
        $datalib.tsv(path, undefined, function (err, data) {
            var aggregation = $datalib.groupby('Skill')
                .summarize([
                    {name: 'Bewertung', ops: ['valid', 'mean'], as: ['c', 'm']}
                ]).execute(data);
            console.log(aggregation);
        });
    }

    return {
        Pivot: Pivot
    }
});
