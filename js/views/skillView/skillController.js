'use strict';

com_geekAndPoke_coolg.SKILL_CONTROLLER = "skillController";

angular.module(com_geekAndPoke_coolg.moduleName).controller(com_geekAndPoke_coolg.SKILL_CONTROLLER,
    function ($scope, $routeParams, $location, $timeout, $q, dimensions, funcs) {

        var MODE_VORONOI = "voronoi";
        var MODE_BUBBLES = "bubbles";

        var Skills = bottle.container.Skills;
        var dl = bottle.container.$datalib;
        var $categories = bottle.container.$categories;
        var mathUtil = bottle.container.mathUtil;

        var currentAttributes = [];

        var skills = new Skills();

        function clearCurrentAttributes() {
            $timeout(function () {
                currentAttributes = [];
            });
        }

        function getAttributesForSkill(skill) {
            return [];
        }

        var width = dimensions.width(-50) * 10 / 12;
        var height = dimensions.height(-70);

        function createLegendSkillList(elementList) {
            var skillList = [];
            var skillName;
            var skillStr;
            var count, meanAssess, meanDuration, category;
            var i, svgElement;
            for (i = 0; i < elementList.length; i++) {
                svgElement = elementList[i];
                skillName = svgElement.getAttribute("_skill");
                if (!funcs.isEmpty(skillName)) {
                    count = svgElement.getAttribute("_count");
                    meanAssess = mathUtil.round(svgElement.getAttribute("_ma"), 1);
                    meanDuration = mathUtil.round(svgElement.getAttribute("_md"), 1);
                    category = svgElement.getAttribute("_cat");
                    skillStr = skillName + " [" + category + "] - " + count + " / " + meanAssess + " / " + meanDuration;
                    skillList.push(skillStr)
                }
            }

            return skillList;
        }

        function getSvgBoundingRectOfElement(selector) {
            var boundingRect = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };
            var element = document.querySelector(selector);
            if (funcs.isDefined(element)) {
                funcs.copyAttributes(["top", "left", "right", "bottom"], element.getBoundingClientRect(), boundingRect);
            }

            return boundingRect;
        }

        function adaptPositionToElement(x, y, selector) {
            var svgBoundingRect = getSvgBoundingRectOfElement(selector);
            var xAdapted = x + svgBoundingRect.left;
            var yAdapted = y + svgBoundingRect.top;

            return {
                x: xAdapted,
                y: yAdapted
            }
        }

        function adaptPositionToSvg(x, y) {
            return adaptPositionToElement(x, y, "svg.canvas")
        }

        function getSkillDetectionForLegendFunction() {
            switch (getMode()) {
                case MODE_VORONOI:
                    return getNearestSkillCircle;

                case MODE_BUBBLES:
                    return getNearbySkillForlegends;
            }
        }

        function getNearbySkillForlegends(x, y) {
            var adapted = adaptPositionToSvg(x, y);
            var forlegends = document.querySelectorAll(".forlegend");
            var i, forlegend, boundingRect;
            var nearbySkillForlegends = [];
            var radius = getLegendDetectorRadius();
            for (i = 0; i < forlegends.length; i++) {
                forlegend = forlegends[i];
                boundingRect = forlegend.getBoundingClientRect();
                if (adapted.x > boundingRect.left - radius && adapted.x < boundingRect.right + radius &&
                    adapted.y > boundingRect.top - radius && adapted.y < boundingRect.bottom + radius) {
                    nearbySkillForlegends.push(forlegend);
                }
            }

            return nearbySkillForlegends;
        }

        function getCenterOfElement(element) {
            var boundingRect = element.getBoundingClientRect();
            var cx = boundingRect.left + (boundingRect.right - boundingRect.left)/2;
            var cy = boundingRect.top + (boundingRect.bottom - boundingRect.top)/2;

            return {
                x: cx,
                y: cy
            }
        }

        function distanceQuadToElement(x, y, element) {
            var center = getCenterOfElement(circle);
            var distanceX = adapted.x - center.x;
            var distanceY = adapted.y - center.y;
            var distanceQuad = distanceX*distanceX + distanceY*distanceY;

            return distanceQuad;
        }

        function getNearestSkillCircle(x, y) {
            var adapted = adaptPositionToSvg(x, y);
            var circles = document.querySelectorAll("circle.skill");
            var i, circle, nearestCircle, center;
            var minDistanceQuad = Number.MAX_VALUE;
            for (i = 0; i < circles.length; i++) {
                circle = circles[i];
                center = getCenterOfElement(circle);
                var distanceX = adapted.x - center.x;
                var distanceY = adapted.y - center.y;
                var distanceQuad = distanceX*distanceX + distanceY*distanceY;
                if(distanceQuad < minDistanceQuad) {
                    minDistanceQuad = distanceQuad;
                    nearestCircle = circle;
                }
            }

            return [nearestCircle];
        }

        function getNearestSkillCircles() {

        }

        function mouseMoved(x, y) {
            console.log([x, y]);
            var nearbySkillForlegends = getSkillDetectionForLegendFunction()(x, y);
            var skillStrList = createLegendSkillList(nearbySkillForlegends);
            updateLegend(skillStrList);

            legend
                .attr("transform", "translate(" + (x + 10) + "," + (y + 10) + ")");
        }

        function switchLegend() {
            if (isLegendShown()) {
                hideLegend();
            }
            else {
                showLegend();
            }
        }

        function isLegendShown() {
            return svg.select("g.legend.on").size() > 0;
        }

        function hideLegend() {
            legend.classed("on", false);
            legend.classed("off", true);
        }

        function showLegend() {
            legend.classed("off", false);
            legend.classed("on", true);
        }

        var legend, legendText, legendRect;

        function appendLegend() {
            legend = svg.append("g")
                .attr("class", "legend off");

            legendRect = legend.append("rect")
                .attr("fill", "#ff00ff")
                .attr("width", 100)
                .attr("height", 100)
                .attr("stroke", "white")
                .attr("opacity", 0.8);

            legendText = legend.append("text")
                .attr("fill", "white");
        }

        function updateLegend(skillStrList) {
            var maxLength = funcs.getLongestString(skillStrList);

            legendRect.transition()
                .attr("height", (skillStrList.length + 2) + "em")
                .attr("width", (maxLength + 1) * (2 / 3) + "em");

            var legendData = legendText.selectAll(".textline")
                .data(skillStrList);

            legendData.enter()
                .append("tspan")
                .attr("font-size", "0.7em")
                .attr("class", "textline")
                .attr("x", "0.3em")
                .attr("y", function (d, i) {
                    return (i + 1) * 10;
                });

            legendText.selectAll(".textline")
                .text(function (d) {
                    return d;
                });

            legendData.exit().remove();

            if (skillStrList.length == 0) {
                hideLegend();
            }
            else {
                showLegend();
            }
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
                mouseMoved(evt[0], evt[1]);
            });

        var svgElement = document.querySelector("svg.canvas");

        var root = svg.append("g")
            .attr("transform", "translate(100, 20)");

        root.append("g")
            .attr("class", "axis xaxis")
            .attr("transform", "translate(0," + (height + 25) + ")");

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
            .attr("class", "field")
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
            .attr("x", xScalePercent(100 / 6))
            .attr("y", yScalePercent(100 / 6));

        var textUpperLeft = field.append("text")
            .attr("text-anchor", "middle")
            .text("Einzelne Experten")
            .attr("class", "quad-label upper-left")
            .attr("x", xScalePercent(100 / 6))
            .attr("y", yScalePercent(100 / 6 * 5));

        var textLowerRight = field.append("text")
            .attr("text-anchor", "middle")
            .text("Viel Einäugige")
            .attr("class", "quad-label lower-right")
            .attr("x", xScalePercent(100 / 6 * 5))
            .attr("y", yScalePercent(100 / 6));

        var textUpperRight = field.append("text")
            .attr("text-anchor", "middle")
            .text("Hohe Kompetenzdichte")
            .attr("class", "quad-label upper-right")
            .attr("x", xScalePercent(100 / 6 * 5))
            .attr("y", yScalePercent(100 / 6 * 5));

        var horizontalLine = field.append("line")
            .attr("class", "divider horizontal")
            .attr("x1", 0)
            .attr("y1", yScalePercent(100 / 2 + 0.5))
            .attr("x2", xScalePercent(100))
            .attr("y2", yScalePercent(100 / 2 + 0.5));

        var verticalLine = field.append("line")
            .attr("class", "divider vertical")
            .attr("x1", xScalePercent(100 / 2 + 0.5))
            .attr("y1", 0)
            .attr("x2", xScalePercent(100 / 2 + 0.5))
            .attr("y2", yScalePercent(0));

        function updateGrid() {
            textLowerLeft.transition()
                .attr("x", xScalePercent(100 / 6))
                .attr("y", yScalePercent(100 / 6));

            textUpperLeft.transition()
                .attr("x", xScalePercent(100 / 6))
                .attr("y", yScalePercent(100 / 6 * 5));

            textLowerRight.transition()
                .attr("x", xScalePercent(100 / 6 * 5))
                .attr("y", yScalePercent(100 / 6));

            textUpperRight.transition()
                .attr("x", xScalePercent(100 / 6 * 5))
                .attr("y", yScalePercent(100 / 6 * 5));

            horizontalLine.transition()
                .attr("x1", 0)
                .attr("y1", yScalePercent(100 / 2 + 0.5))
                .attr("x2", xScalePercent(100))
                .attr("y2", yScalePercent(100 / 2 + 0.5));

            verticalLine.transition()
                .attr("x1", xScalePercent(100 / 2 + 0.5))
                .attr("y1", 0)
                .attr("x2", xScalePercent(100 / 2 + 0.5))
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
                .domain([0, maxY])
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
            if (index > -1) {
                categories.splice(index, 1);
                draw();
            }
        }

        function showCategory(category) {
            categories.length = 0;
            categories.push(category);
            draw();
        }

        function showLocation(location) {
            locations.length = 0;
            locations.push(location);
            draw();
        }

        function isCategoryHidden(category) {
            return ($routeParams["h_" + category] == "y");
        }

        function switchCategory(category) {
            if (isCategoryHidden(category)) {
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

        function categoryFromSkill(d) {
            var cat = "?";
            var categoryValues = d["values_Skill-Unterkategorie"];
            if (!funcs.isEmpty(categoryValues)) {
                cat = categoryValues[0]["Skill-Unterkategorie"];
            }

            return cat;
        }

        function getMode() {
            switch($routeParams.mode) {
                case "v":
                    return MODE_VORONOI;

                default:
                    return MODE_BUBBLES;
            }
        }

        function draw() {
            switch(getMode()) {
                case MODE_VORONOI:
                    drawVoronoiSkills();
                    break;

                case MODE_BUBBLES:
                    drawSkills();
                    break;
            }
        }

        function getLegendDetectorRadius() {
            switch (getMode()) {
                case MODE_VORONOI:
                    return 0;

                case MODE_BUBBLES:
                    return 10;
            }
        }

        function drawVoronoiSkills() {
            function createLayers() {
                var layers = ["paths", "circles", "texts"];
                var enter = field.selectAll("g.layer")
                    .data(layers, function(d) {
                        return d;
                    })
                    .enter();

                enter
                    .append("g")
                    .attr("class", function(d) {
                        return "layer " + d;
                    });
           }

            var data = skills.recalcSkills(locations, categories);

            drawField(xMax(data), 4);
            createLayers();

            var filteredData = data.filter(function (d) {
                return funcs.isEmpty(input.skillNameFilter) || d["Skill"].toLowerCase().indexOf(input.skillNameFilter) > -1;
            });

            var vertices = filteredData.map(function (d) {
                var vert = [xScale(d["Anzahl Mitarbeiter"]), yScale(yScaleForSkill(d))];
                vert.skill = d["Skill"];
                vert.category = categoryFromSkill(d);
                vert.ma = d["Mittlere Skilldauer"];
                vert.md = d["Mittlere Bewertung"];
                vert.count = d["Anzahl Mitarbeiter"];
                return vert;
            });

            var voronoi = d3.geom.voronoi()
                .clipExtent([[0, 0], [width, height]]);

            function polygon(d, i) {
                return "M" + d.join("L") + "Z";
            }

            var voronoiVertices = voronoi(vertices);
            var voronoiVerticesWithoutUndefines = voronoiVertices.filter(function(d) {
                return funcs.isDefined(d);
            });

            var pathData = field.select("g.paths").selectAll("path.skill")
                .data(voronoiVerticesWithoutUndefines, polygon);

            pathData.exit().remove();

            pathData.enter().append("path")
                .attr("class", "skill forlegend")
                .attr("_skill", function (d) {
                    return d.point.skill;
                })
                .attr("_count", function (d) {
                    return d.point.count;
                })
                .attr("_ma", function (d) {
                    return d.point.ma;
                })
                .attr("_md", function (d) {
                    return d.point.md;
                })
                .attr("_cat", function(d) {
                    return d.point.category;
                })
                .attr("stroke", "black")
                .attr("opacity", "0.3")
                .attr("fill", function (d) {
                    var color = skills.categoryToColor(d.point.category);
                    return color;
                });

            field.selectAll("path.skill")
                .transition()
                .attr("d", polygon);

            //pathData.order();

            var vertData = field.select("g.circles").selectAll("circle.skill")
                .data(vertices, function(d) {
                    return d.skill;
                });

            vertData
                .enter().append("circle")
                .attr("class", "skill")
                .attr("_skill", function (d) {
                    return d.skill;
                })
                .attr("_count", function (d) {
                    return d.count;
                })
                .attr("_ma", function (d) {
                    return d.ma;
                })
                .attr("_md", function (d) {
                    return d.md;
                })
                .attr("_cat", function(d) {
                    return d.category;
                })
                .attr("cx", xScalePercent(50))
                .attr("cy", yScalePercent(50))
                .attr("opacity", "0.6")
                .attr("r", 5)
                .attr("fill", function (d) {
                    var color = skills.categoryToColor(d.category);
                    return color;
                });

            field.selectAll("circle.skill")
                .transition()
                .attr("cx", function (d) {
                    return d[0];
                })
                .attr("cy", function (d) {
                    return d[1];
                });

            vertData.exit().remove();

            var textData = field.select("g.texts").selectAll("text.skill")
                .data(vertices, function(d) {
                    return d.skill;
                });

            textData
                .enter().append("text")
                .attr("class", "skill")
                .attr("x", xScalePercent(50))
                .attr("y", yScalePercent(50))
                .attr("opacity", "0.5")
                .attr("font-size", "0.7em")
                .text(function(d) {
                    return d.skill;
                });

            field.selectAll("text.skill")
                .transition()
                .attr("x", function (d) {
                    return d[0];
                })
                .attr("y", function (d) {
                    return d[1];
                });

            textData.exit().remove();

        }

        /**
         * draw the matrix and circles
         */
        function drawSkills() {
            var data = skills.recalcSkills(locations, categories);
            drawField(xMax(data), 4);

            var filteredData = data.filter(function (d) {
                return funcs.isEmpty(input.skillNameFilter) || d["Skill"].toLowerCase().indexOf(input.skillNameFilter) > -1;
            });

            var gSkillData = field.selectAll("g.skill")
                .data(filteredData, function (d) {
                    return d["Skill"];
                });

            // propagate downwards
            field.selectAll("g.skill").select("circle");

            var gSkillEnter = gSkillData.enter()
                .append("g")
                .attr("class", function (d) {
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
                .attr("class", "skill forlegend")
                .attr("opacity", "0.5")
                .attr("fill", function (d) {
                    var color = skills.categoryToColor(categoryFromSkill(d));
                    return color;
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
                .attr("r", function (d) {
                    return radiusForSkill(d);
                })
                .attr("_skill", function (d) {
                    return d["Skill"];
                })
                .attr("_count", function (d) {
                    return d["Anzahl Mitarbeiter"];
                })
                .attr("_ma", function (d) {
                    return d["Mittlere Bewertung"];
                })
                .attr("_md", function (d) {
                    return d["Mittlere Skilldauer"];
                })
                .attr("_cat", categoryFromSkill);

            gSkillData.exit().remove();
        }

        function skillNameFilterChanged() {
            draw();
        }

        $scope.skillNameFilterChanged = skillNameFilterChanged;

        var input = {};

        $scope.input = input;

        var categories = ['*'];
        var locations = ['*'];

        $scope.makeSafeForCSS = funcs.makeSafeForCSS;

        skills.ready.then(function () {
            $scope.switchCategory = switchCategory;
            $scope.showCategory = showCategory;
            $scope.showLocation = showLocation;

            $scope.getColorForCategory = skills.categoryToColor;

            // Hide buttons
            $scope.hideButtons = $routeParams.hb;

            $scope.allCategories = skills.categories;
            $scope.allLocations = skills.locations;

            $scope.shorten = $categories.shorten;

            draw();

            clearCurrentAttributes();
        });
    });