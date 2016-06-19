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

        function extractLocations(data) {
            var locations = dl.unique(data, funcs.createAccessorFunction("Standort"));
            locations.sort();

            return locations;
        }

        var promise = new SimplePromise();

        me.ready = promise.promise;
        me.categories = undefined;
        me.locations = undefined;
        me.categoryToColor = categoryToColor;

        var rawData;

        function recalcSkills(locations, categories) {
            function filter(skill) {
                var valLocation = funcs.isInArray(locations, "*") || funcs.isInArray(locations, skill["Standort"]);
                var valCategory = funcs.isInArray(categories, "*") || funcs.isInArray(categories, skill["Skill-Unterkategorie"]);

                return valLocation && valCategory;
            }

            var filteredData = rawData.filter(filter);
            var aggregation = dl.groupby('Skill')
                .summarize([
                    {name: 'Bewertung', ops: ['mean'], as: ['Mittlere Bewertung']},
                    {name: 'Anzahl Mitarbeiter', ops: ['sum'], as: ['Anzahl Mitarbeiter']},
                    {
                        name: 'Anzahl Experten',
                        get: function(row) {
                            if(row['Bewertung'] > 2) {
                                return row['']
                            }
                        }},
                    {name: 'Skill Dauer', ops: ['mean'], as: ['Mittlere Skilldauer']},
                    {name: 'Skill-Unterkategorie', ops: ['values']}
                ]).execute(filteredData);

            return aggregation;
        }

        me.recalcSkills = recalcSkills;

        dl.tsv("rsrc/skills.txt", undefined, function (err, data) {
            rawData = data;
            me.categories = extractCategories(data);
            me.locations = extractLocations(data);
            promise.resolve();
        });
    }

    return Skills;
});