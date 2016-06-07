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
        me.categories = undefined;
        me.categoryToColor = categoryToColor;
        me.values = undefined;

        var rawData;
        
        function recalc(locations, categories) {
            function filter(skill) {
                var valLocation = funcs.isEmpty(locations) ? true : funcs.isInArray(locations, skill["Standort"]);
                var valCategory = funcs.isEmpty(categories) ? true : funcs.isInArray(categories, skill["Skill-Unterkategorie"]);

                return valLocation && valCategory;
            }

            var filteredData = rawData.filter(filter);
        }

        dl.tsv("rsrc/skills.txt", undefined, function (err, data) {
            me.categories = extractCategories(data);
            var aggregation = dl.groupby('Skill')
                .summarize([
                    {name: 'Bewertung', ops: ['mean'], as: ['Mittlere Bewertung']},
                    {name: 'Anzahl Mitarbeiter', ops: ['sum'], as: ['Anzahl Mitarbeiter']},
                    {name: 'Skill Dauer', ops: ['mean'], as: ['Mitllere Skilldauer']}
                ]).execute(data);
            me.values = aggregation;
            promise.resolve();
        });
    }

    return Skills;
});