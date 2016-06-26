'use strict';

bottle.factory("Skills", function(container) {
    var funcs = container.funcs;
    var dl = container.$datalib;
    var SimplePromise = container.SimplePromise;
    var colorUtil = container.colorUtil;
    var constants = container.constants;

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
            var categories = dl.unique(data, funcs.createAccessorFunction(constants.COLUMN_SKILL_UNTERKATEGORIE));
            categories.sort();

            return categories;
        }

        function extractLocations(data) {
            var locations = dl.unique(data, funcs.createAccessorFunction(constants.COLUMN_STANDORT));
            locations.sort();

            return locations;
        }

        function categoryFromSkill(skill) {
            var cat = "?";
            var categoryValues = skill["values_" + constants.COLUMN_SKILL_UNTERKATEGORIE];
            if (!funcs.isEmpty(categoryValues)) {
                cat = categoryValues[0][constants.COLUMN_SKILL_UNTERKATEGORIE];
            }

            return cat;
        }

        function clusterSkills(aggregation) {
            var clusters = {};
            function addToClusters(skill) {
                var category = categoryFromSkill(skill);
                if(!funcs.isDefined(clusters[category])) {
                    clusters[category] = [];
                }
                clusters[category].push(skill);
            }

            aggregation.forEach(function(skill) {
                addToClusters(skill);
            });

            return clusters;
        }

        function addSkillToBranch(skill, branch) {
            var child = {
                name: skill["Skill"],
                ma: skill["Mittlere Bewertung"],
                md: skill["Mittlere Skilldauer"],
                count: skill["Anzahl Mitarbeiter"],
                expertCount: skill["Anzahl Experten"],
                category: categoryFromSkill(skill)
            };
            branch.push(child);
        }

        function createTree(aggregation) {
            var tree = {
                name: "Skills",
                children: []
            };

            var clusters = clusterSkills(aggregation);
            funcs.forEachKeyAndVal(clusters, function(category, skills) {
                var child = {name: category, children: []};
                skills.forEach(function(skill) {
                    addSkillToBranch(skill, child.children);
                });
                tree.children.push(child);
            });

            return tree;
        }

        function createFlatTree(aggregation) {
            var tree = {
                name: "Skills",
                children: []
            };

            aggregation.forEach(function(skill) {
                addSkillToBranch(skill, tree.children);
            });

            return tree;
        }

        var promise = new SimplePromise();

        me.ready = promise.promise;
        me.categories = undefined;
        me.locations = undefined;
        me.categoryToColor = categoryToColor;
        me.categoryFromSkill = categoryFromSkill;
        me.createTree = createTree;
        me.createFlatTree = createFlatTree;

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
                        get: function(skill) {
                            return (skill['Bewertung'] > 2 ? skill['Anzahl Mitarbeiter'] : 0);
                        },
                        ops: ['sum'],
                        as: ['Anzahl Experten']
                    },
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