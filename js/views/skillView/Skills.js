'use strict';

bottle.factory("Skills", function(container) {
    var funcs = container.funcs;
    var dl = container.$datalib;
    var SimplePromise = container.SimplePromise;
    var colorUtil = container.colorUtil;

    function Skills() {
        var me = this;
        
        function categoryToInt(category) {
            return me.categories.indexOf(category);
        }
        
        function categoryToColor(category) {
            var number = categoryToInt(category);
            return colorUtil.intToTwentyColors(number);
        }

        function extractCategories(data) {
            me.categories = dl.unique(data, funcs.createAccessorFunction("Skill-Unterkategorie"));
            me.categories.sort();
        }

        var promise = new SimplePromise();

        me.ready = promise.promise;

        dl.tsv("rsrc/skills.txt", undefined, function (err, data) {
            extractCategories(data);
            var aggregation = dl.groupby('Skill')
                .summarize([
                    {name: 'Bewertung', ops: ['valid', 'mean'], as: ['c', 'm']}
                ]).execute(data);
            console.log(aggregation);
        });
    }

    return Skills;
});