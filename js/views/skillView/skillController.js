'use strict';

com_geekAndPoke_coolg.SKILL_CONTROLLER = "skillController";

angular.module(com_geekAndPoke_coolg.moduleName).controller(com_geekAndPoke_coolg.SKILL_CONTROLLER,
    function ($scope, $routeParams, $location, $timeout, $q, dimensions, funcs) {
        var Skills = bottle.container.Skills;
        var dl = bottle.container.$datalib;

        var currentAttributes = [];

        var skills = new Skills();

        function clearCurrentAttributes() {
            $timeout(function() {
                currentAttributes = [];
            });
        }

        function getAttributesForSkill(skill) {
            return [];
        }

        function setCurrentAttributes(skill) {
            $timeout(function() {
                currentAttributes = getAttributesForSkill(skill);
                $scope.attributes = currentAttributes;
            });
        }

        var width = (dimensions.screenDimensions.width - 50) * 10/12;
        var height = (dimensions.screenDimensions.height - 70);
        var margin = {"left": 100, "bottom": 25, "right": 5};

        var svg = d3.select("#canvas")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "svg");

        svg.append("g")
            .attr("class", "axis xaxis")
            .attr("transform", "translate(" + (margin.left - 10) + "," + (height - 30) + ")");

        svg.append("g")
            .attr("class", "axis yaxis")
            .attr("transform", "translate(" + (margin.left - 10) + "," + 10 + ")");

        var xLabel = svg.append("text")
            .attr("x", 100)
            .attr("y", height - 2)
            .attr("class", "axis wcm-label")
            .text("Anzahl Mitarbeiter");

        var yLabelX = margin.left - 15;
        var yLabelY = height - 75;
        var yLabel = svg.append("text")
            .attr("x", yLabelX)
            .attr("y", yLabelY)
            .attr("class", "axis wcm-label")
            .text("Durchschnittliche Bewertung")
            .attr("transform", "rotate(270 " + yLabelX + "," + yLabelY + ")");

        var quadrant_group = svg.append("g")
            .attr("transform", "translate(" + margin.left + ",0)");

        var xScale, yScale;

        function drawField(maxX, maxY) {

            xScale = d3.scale.linear()
                .domain([0, maxX])
                .range([0, width - margin.left - margin.right]);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .ticks(10)
                .orient("bottom");

            yScale = d3.scale.linear()
                .domain([0, maxY])
                .range([height - margin.bottom - 10 - 6, 0]);

            var yAxis = d3.svg.axis()
                .scale(yScale)
                .ticks(10)
                .orient("left");

            svg.select(".xaxis")
                .transition()
                .call(xAxis);

            svg.select(".yaxis")
                .transition()
                .call(yAxis);

            (function createGrid() {
                /* Wenige */
                quadrant_group.append("text")
                    .attr("x", xScale(maxX/6))
                    .attr("y", yScale(maxY/6))
                    .attr("text-anchor", "middle")
                    .text("Weißer Fleck")
                    .attr("class", "quad-label");

                quadrant_group.append("text")
                    .attr("x", xScale(maxX/6))
                    .attr("y", yScale(maxY/6 * 5))
                    .attr("text-anchor", "middle")
                    .text("Einzelne Experten")
                    .attr("class", "quad-label");

                // Viel
                quadrant_group.append("text")
                    .attr("x", xScale(maxX/6 * 5))
                    .attr("y", yScale(maxY/6))
                    .attr("text-anchor", "middle")
                    .text("Viel Einäugige")
                    .attr("class", "quad-label");

                quadrant_group.append("text")
                    .attr("x", xScale(maxX/6 * 5))
                    .attr("y", yScale(maxY/6 * 5))
                    .attr("text-anchor", "middle")
                    .text("Kompetenzdichte")
                    .attr("class", "quad-label");

                // creating the dividers
                quadrant_group.append("line")
                    .attr("x1", 0)
                    .attr("y1", yScale(maxY/2))
                    .attr("x2", xScale(maxX))
                    .attr("y2", yScale(maxY/2))
                    .attr("class", "divider");

                quadrant_group.append("line")
                    .attr("x1", xScale(maxX/2))
                    .attr("y1", 0)
                    .attr("x2", xScale(maxX/2))
                    .attr("y2", yScale(0))
                    .attr("class", "divider");
            })();
        }

        function yScaleForSkill(skill) {
            return skill["Mittlere Bewertung"];
        }

        function radiusForSkill(skill) {
            return skill["Mittlere Skilldauer"] * 5;
        }

        /* **************
         * Filter
         * *************/

        function hideCategory(category) {
            var index = categories.indexOf(category);
            if(index > -1) {
                categories.splice(index, 1);
                drawSkills();
            }
        }
        
        function showCategory(category) {
            if(categories.indexOf(category) < 0) {
                categories.push(category);
                drawSkills();
            }
        }

        function isCategoryHidden(category) {
            return ($routeParams["h_" + category] == "y");
        }

        function switchCategory(category) {
            if(isCategoryHidden(category)) {
                $location.search("h_" + category, "n");
                showCategory(category);
            }
            else {
                $location.search("h_" + category, "y");
                hideCategory(category);
            }
        }

        /**
         * draw the matrix and circles
         * @param category
         */
        function drawSkills() {
            function mouseHandlingOnIcon(selection) {
                selection
                    .on("click", function (d) {
                        d3.select(".circle-hover").classed("circle-hover", false);
                        d3.select(this).classed("circle-hover", true);
                        setCurrentAttributes(d);
                    });
            }

            var data = skills.recalcSkills(locations, categories);

            var xMax = dl.max(data, funcs.createAccessorFunction("Anzahl Mitarbeiter"));
            var yMax = dl.max(data, funcs.createAccessorFunction("Mittlere Bewertung"));

            drawField(xMax, yMax);

            var gSkillData = quadrant_group.selectAll("g.skill")
                .data(data);

            var gSkill = gSkillData.enter()
                .append("g")
                .attr("class", "skill");



            gSkill
                .transition()
                .attr("transform", function (d) {
                    return "translate(" + xScale(d["Anzahl Mitarbeiter"]) + "," + yScale(yScaleForSkill(d)) + ")";
                });

            var gMeasureA = gSkill.append("svg:a")
                .attr("xlink:href", function(d) {
                    return d.url;
                })
                .attr("target", "_blank");

            gMeasureA.append("circle")
                .attr("r", function(d) {
                    return radiusForSkill(d);
                })
                .attr("opacity", "0.1")
                .attr("fill", function(d) {
                    var color = skills.categoryToColor(skills.skillToCategory(d["Skill"]));
                    return color;
                })
                .attr("class", "circle")
                .call(mouseHandlingOnIcon);

            gMeasureA.append("title")
                .text(function(d) {
                    return d["Skill"];
                });

            gMeasureA.append("text")
                .attr("opacity", 1)
                .attr("class", function (d) {
                    return "wcm-label item cat-" + d;
                })
                .attr("y", 0)
                .attr("x", 0)
                .text(function (d) {
                    return d["Skill"];
                })
                .on("click", function (d) {
                    d3.select(".circle-hover").classed("circle-hover", false);
                    d3.select("circle.cat-" + d).classed("circle-hover", true);
                    setCurrentAttributes(d);
                });
        }

        var categories = [];
        var locations = [];

        $scope.makeSafeForCSS = funcs.makeSafeForCSS;

        skills.ready.then(function() {
            Array.prototype.push.apply(categories, skills.categories);
            Array.prototype.push.apply(locations, skills.locations);
            $scope.switchCategory = switchCategory;

            $scope.getColorForCategory = skills.categoryToColor;

            // Hide buttons
            $scope.hideButtons = $routeParams.hb;

            $scope.allCategories = skills.categories;
            $scope.categorySwitchModel = {};
            $scope.allCategories.forEach(function(category) {
                $scope.categorySwitchModel[category] = !isCategoryHidden(category);
            });

            drawSkills();

            clearCurrentAttributes();
        });
    });