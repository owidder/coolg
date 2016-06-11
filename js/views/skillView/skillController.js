'use strict';

com_geekAndPoke_coolg.SKILL_CONTROLLER = "skillController";

angular.module(com_geekAndPoke_coolg.moduleName).controller(com_geekAndPoke_coolg.SKILL_CONTROLLER,
    function ($scope, $routeParams, $location, $timeout, $q, dimensions, funcs) {
        var Skills = bottle.container.Skills;
        var dl = bottle.container.$datalib;
        var $categories = bottle.container.$categories;

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

        var textLowerLeft = quadrant_group.append("text")
            .attr("text-anchor", "middle")
            .text("Weißer Fleck")
            .attr("class", "quad-label lower-left");

        var textUpperLeft = quadrant_group.append("text")
            .attr("text-anchor", "middle")
            .text("Einzelne Experten")
            .attr("class", "quad-label upper-left");

        var textLowerRight = quadrant_group.append("text")
            .attr("text-anchor", "middle")
            .text("Viel Einäugige")
            .attr("class", "quad-label lower-right");

        var textUpperRight = quadrant_group.append("text")
            .attr("text-anchor", "middle")
            .text("Kompetenzdichte")
            .attr("class", "quad-label upper-right");

        var horizontalLine = quadrant_group.append("line")
            .attr("class", "divider horizontal");

        var verticalLine = quadrant_group.append("line")
            .attr("class", "divider vertical");

        function updateGrid(maxX, maxY) {
            textLowerLeft.transition()
                .attr("x", xScale(maxX/6))
                .attr("y", yScale(maxY/6));

            textUpperLeft.transition()
                .attr("x", xScale(maxX/6))
                .attr("y", yScale(maxY/6 * 5));

            textLowerRight.transition()
                .attr("x", xScale(maxX/6 * 5))
                .attr("y", yScale(maxY/6));

            textUpperRight.transition()
                .attr("x", xScale(maxX/6 * 5))
                .attr("y", yScale(maxY/6 * 5));

            horizontalLine.transition()
                .attr("x1", 0)
                .attr("y1", yScale(maxY/2))
                .attr("x2", xScale(maxX))
                .attr("y2", yScale(maxY/2));

            verticalLine.transition()
                .attr("x1", xScale(maxX/2))
                .attr("y1", 0)
                .attr("x2", xScale(maxX/2))
                .attr("y2", yScale(0));
        }

        function yScaleForSkill(skill) {
            return skill["Mittlere Bewertung"];
        }

        function radiusForSkill(skill) {
            return skill["Mittlere Skilldauer"] * 5;
        }

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

            updateGrid(maxX, maxY);
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
            categories.length = 0;
            categories.push(category);
            drawSkills();
        }

        function showLocation(location) {
            locations.length = 0;
            locations.push(location);
            drawSkills();
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

        function xMax(data) {
            return dl.max(data, funcs.createAccessorFunction("Anzahl Mitarbeiter"));
        }

        function yMax(data) {
            return dl.max(data, funcs.createAccessorFunction("Mittlere Bewertung"));
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
            drawField(xMax(data), yMax(data));

            var gSkillData = quadrant_group.selectAll("g.skill")
                .data(data, function (d) {
                    return d["Skill"];
                });

            var gSkillEnter = gSkillData.enter()
                .append("g")
                .attr("class", "skill");

            quadrant_group.selectAll("g.skill")
                .transition()
                .attr("transform", function (d) {
                    return "translate(" + xScale(d["Anzahl Mitarbeiter"]) + "," + yScale(yScaleForSkill(d)) + ")";
                });

            var gSkillEnterG = gSkillEnter.append("g");

            gSkillEnterG.append("circle")
                .attr("class", "skill")
                .attr("opacity", "0.1")
                .attr("fill", function(d) {
                    var color = skills.categoryToColor(skills.skillToCategory(d["Skill"]));
                    return color;
                })
                .call(mouseHandlingOnIcon)
                .append("title")
                .text(function(d) {
                    return d["Skill"];
                });

            gSkillEnterG.append("text")
                .attr("opacity", 1)
                .attr("class", "wcm-label item")
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

            quadrant_group.selectAll("circle.skill")
                .attr("r", function(d) {
                    return radiusForSkill(d);
                });


            gSkillData.exit().remove();
        }

        var categories = ['*'];
        var locations = ['*'];

        $scope.makeSafeForCSS = funcs.makeSafeForCSS;

        skills.ready.then(function() {
            $scope.switchCategory = switchCategory;
            $scope.showCategory = showCategory;
            $scope.showLocation = showLocation;

            $scope.getColorForCategory = skills.categoryToColor;

            // Hide buttons
            $scope.hideButtons = $routeParams.hb;

            $scope.allCategories = skills.categories;
            $scope.allLocations = skills.locations;

            $scope.shorten = $categories.shorten;

            drawSkills();

            clearCurrentAttributes();
        });
    });