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
            var categories = dl.unique(data, funcs.createAccessorFunction("Skill-Unterkategorie"));
            categories.sort();

            return categories;
        }

        var promise = new SimplePromise();

        me.ready = promise.promise;
        me.categories = extractCategories();
        me.categoryToColor = categoryToColor;
        me.skills = undefined;

        dl.tsv("rsrc/skills.txt", undefined, function (err, data) {
            extractCategories(data);
            var aggregation = dl.groupby('Skill')
                .summarize([
                    {name: 'Bewertung', ops: ['valid', 'mean'], as: ['Anzahl Bewertungen', 'Mittlere Bewertung']},
                    {name: 'Mitarbeiter', ops: ['valid'], as: ['Anzahl Mitarbeiter']},
                    {name: 'Projekte', ops: ['valid'], as: ['Anzahl Projekte']}
                ]).execute(data);
            me.skills = aggregation;
            console.log(aggregation);
        });
    }

    return Skills;
});