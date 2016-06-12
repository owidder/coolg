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

        var width = (dimensions.screenDimensions.width - 50) * 10/12;
        var height = (dimensions.screenDimensions.height - 70);

        function createIntersectSkillList(elementList) {
            var skillList = [];
            elementList.forEach(function(svgElement) {
                if(svgElement.tagName == "circle" && !funcs.isEmpty(svgElement.getAttribute("_skill"))) {
                    
                }
            });
        }

        function moveLegend(x, y) {
            var rect = svgElement.createSVGRect();
            rect.x = x-5;
            rect.y = y-5;
            rect.width = 10;
            rect.height = 10;
            var elementList = svgElement.getIntersectionList(rect, null);
            if(elementList.length > 10) {
                console.log(elementList.length);
            }
            legend
                .attr("transform", "translate(" + x + "," + y + ")");
        }

        function switchLegend() {
            if(svg.select("g.legend.on").size() > 0) {
                legend.classed("on", false);
                legend.classed("off", true);
            }
            else {
                legend.classed("off", false);
                legend.classed("on", true);
            }
        }

        var legend;

        function appendLegend() {
            legend = svg.append("g")
                .attr("class", "legend off");

            legend.append("rect")
                .attr("fill", "grey")
                .attr("width", 100)
                .attr("height", 100)
                .attr("stroke", "white")
                .attr("opacity", 0.8);

            var text = legend.append("text")
                .attr("fill", "white");

            text
                .append("tspan")
                .attr("x", "0.1em")
                .attr("dy", "1em")
                .text("Legende 1");

            text
                .append("tspan")
                .attr("x", "0.1em")
                .attr("dy", "1em")
                .text("Legende 2");
        }

        var svg = d3.select("#canvas")
            .append("svg")
            .attr("width", width + 300)
            .attr("height", height + 300)
            .attr("class", "svg canvas")
            .on("click", function () {
                switchLegend();
            })
            .on("mousemove", function () {
                var evt = d3.mouse(this);
                moveLegend(evt[0], evt[1]);
            });

        var svgElement = document.querySelector("svg.canvas");

        var root = svg.append("g")
            .attr("transform", "translate(100, 20)");

        root.append("g")
            .attr("class", "axis xaxis")
            .attr("transform", "translate(0," + (height+25) + ")");

        root.append("g")
            .attr("class", "axis yaxis")
            .attr("transform", "translate(-25, 0)");

        var xLabel = root.append("text")
            .attr("x", 0)
            .attr("y", height + 60)
            .attr("class", "axis wcm-label")
            .text("Anzahl Mitarbeiter");

        var yLabelX = -60;
        var yLabelY = height;
        var yLabel = root.append("text")
            .attr("x", yLabelX)
            .attr("y", yLabelY)
            .attr("class", "axis wcm-label")
            .text("Durchschnittliche Bewertung")
            .attr("transform", "rotate(270 " + yLabelX + "," + yLabelY + ")");

        var field = root.append("g")
            .attr("transform", "translate(0, 0)");

        appendLegend();

        var xScale, yScale;
        var xScalePercent = d3.scale.linear()
            .domain([0, 100])
            .range([0, width]);
        var yScalePercent = d3.scale.linear()
            .domain([0, 100])
            .range([height, 0]);

        var textLowerLeft = field.append("text")
            .attr("text-anchor", "middle")
            .text("Weißer Fleck")
            .attr("class", "quad-label lower-left")
            .attr("x", xScalePercent(100/6))
            .attr("y", yScalePercent(100/6));

        var textUpperLeft = field.append("text")
            .attr("text-anchor", "middle")
            .text("Einzelne Experten")
            .attr("class", "quad-label upper-left")
            .attr("x", xScalePercent(100/6))
            .attr("y", yScalePercent(100/6 * 5));

        var textLowerRight = field.append("text")
            .attr("text-anchor", "middle")
            .text("Viel Einäugige")
            .attr("class", "quad-label lower-right")
            .attr("x", xScalePercent(100/6 * 5))
            .attr("y", yScalePercent(100/6));

        var textUpperRight = field.append("text")
            .attr("text-anchor", "middle")
            .text("Hohe Kompetenzdichte")
            .attr("class", "quad-label upper-right")
            .attr("x", xScalePercent(100/6 * 5))
            .attr("y", yScalePercent(100/6 * 5));

        var horizontalLine = field.append("line")
            .attr("class", "divider horizontal")
            .attr("x1", 0)
            .attr("y1", yScalePercent(100/2 + 0.5))
            .attr("x2", xScalePercent(100))
            .attr("y2", yScalePercent(100/2 + 0.5));

        var verticalLine = field.append("line")
            .attr("class", "divider vertical")
            .attr("x1", xScalePercent(100/2 + 0.5))
            .attr("y1", 0)
            .attr("x2", xScalePercent(100/2 + 0.5))
            .attr("y2", yScalePercent(0));

        function updateGrid() {
            textLowerLeft.transition()
                .attr("x", xScalePercent(100/6))
                .attr("y", yScalePercent(100/6));

            textUpperLeft.transition()
                .attr("x", xScalePercent(100/6))
                .attr("y", yScalePercent(100/6 * 5));

            textLowerRight.transition()
                .attr("x", xScalePercent(100/6 * 5))
                .attr("y", yScalePercent(100/6));

            textUpperRight.transition()
                .attr("x", xScalePercent(100/6 * 5))
                .attr("y", yScalePercent(100/6 * 5));

            horizontalLine.transition()
                .attr("x1", 0)
                .attr("y1", yScalePercent(100/2 + 0.5))
                .attr("x2", xScalePercent(100))
                .attr("y2", yScalePercent(100/2 + 0.5));

            verticalLine.transition()
                .attr("x1", xScalePercent(100/2 + 0.5))
                .attr("y1", 0)
                .attr("x2", xScalePercent(100/2 + 0.5))
                .attr("y2", yScalePercent(0));
        }

        function yScaleForSkill(skill) {
            return skill["Mittlere Bewertung"];
        }

        function radiusForSkill(skill) {
            return skill["Mittlere Skilldauer"] * 5;
        }

        function drawField(maxX, maxY) {

            xScale = d3.scale.linear()
                .domain([1, maxX])
                .range([0, width]);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .ticks(10)
                .orient("bottom");

            yScale = d3.scale.linear()
                .domain([1, maxY])
                .range([height, 0]);

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
            var data = skills.recalcSkills(locations, categories);
            drawField(xMax(data), 4);

            var gSkillData = field.selectAll("g.skill")
                .data(data, function (d) {
                    return d["Skill"];
                });

            var gSkillEnter = gSkillData.enter()
                .append("g")
                .attr("class", function(d) {
                    return "skill " + funcs.makeSafeForCSS(d["Skill"]);
                })
                .attr("transform", function (d) {
                    return "translate(" + xScalePercent(50) + "," + yScalePercent(50) + ")";
                });

            field.selectAll("g.skill")
                .transition()
                .attr("transform", function (d) {
                    return "translate(" + xScale(d["Anzahl Mitarbeiter"]) + "," + yScale(yScaleForSkill(d)) + ")";
                });

            var gSkillEnterG = gSkillEnter.append("g");

            gSkillEnterG.append("circle")
                .attr("class", "skill")
                .attr("opacity", "0.5")
                .attr("fill", function(d) {
                    var color = skills.categoryToColor(skills.skillToCategory(d["Skill"]));
                    return color;
                })
                .attr("_skill", function (d) {
                    return d["Skill"];
                })
                .attr("_count", function(d) {
                    return d["Anzahl Mitarbeiter"];
                })
                .attr("_ma", function (d) {
                    return d["Mittlere Bewertung"];
                })
                .attr("_md", function(d) {
                    return d["Mittlere Skilldauer"];
                })
                .append("title")
                .text(function(d) {
                    return d["Skill"];
                });

            gSkillEnterG.append("text")
                .attr("opacity", 0.5)
                .attr("class", "wcm-label item")
                .attr("y", 0)
                .attr("x", 0)
                .text(function (d) {
                    return d["Skill"];
                });

            field.selectAll("circle.skill")
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