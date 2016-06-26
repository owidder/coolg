'use strict';

com_geekAndPoke_coolg.SKILL_CONTROLLER = "skillController";

angular.module(com_geekAndPoke_coolg.moduleName).controller(com_geekAndPoke_coolg.SKILL_CONTROLLER,
    function ($scope, $routeParams, $location, $timeout, $q, dimensions, funcs) {

        var MODE_VORONOI = "voronoi";
        var MODE_BUBBLES = "bubbles";
        var MODE_TREEMAP = "treemap";

        var Skills = bottle.container.Skills;
        var dl = bottle.container.$datalib;
        var $categories = bottle.container.$categories;
        var mathUtil = bottle.container.mathUtil;

        var skills = new Skills();

        var width = dimensions.width(-50) * 10 / 12;
        var height = dimensions.height(-70);

        var xScalePercent = d3.scale.linear()
            .domain([0, 100])
            .range([0, width]);
        var yScalePercent = d3.scale.linear()
            .domain([0, 100])
            .range([height, 0]);

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
            })
            .on("mouseout", hideLegend);

        svg.append("g")
            .attr("class", "root")
            .attr("transform", "translate(100, 20)");

        function createLegendSkillList(elementList) {
            var skillList = [];
            var skillName;
            var skillStr;
            var count, expertCount, meanAssess, meanDuration, category;
            var i, svgElement;
            for (i = 0; i < elementList.length; i++) {
                svgElement = elementList[i];
                skillName = svgElement.getAttribute("_skill");
                if (!funcs.isEmpty(skillName)) {
                    count = svgElement.getAttribute("_count");
                    expertCount = svgElement.getAttribute("_ec");
                    meanAssess = mathUtil.round(svgElement.getAttribute("_ma"), 1);
                    meanDuration = mathUtil.round(svgElement.getAttribute("_md"), 1);
                    category = svgElement.getAttribute("_cat");
                    skillStr = skillName + " [" + category + "] - " + count + " (" + expertCount + ") / " + meanAssess + " / " + meanDuration;
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
                    return getNearestSkillCircles;

                case MODE_BUBBLES:
                case MODE_TREEMAP:
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
            var center = getCenterOfElement(element);
            var distanceX = x - center.x;
            var distanceY = y - center.y;
            var distanceQuad = distanceX*distanceX + distanceY*distanceY;

            return distanceQuad;
        }

        function getNearestSkillCircles(x, y) {
            var adapted = adaptPositionToSvg(x, y);
            var circles = document.querySelectorAll("circle.skill");
            var i, nearestCircle, nearestCircles = [], centerOfCircle;
            var minDistanceQuad = Number.MAX_VALUE;

            // find nearest circle
            for (i = 0; i < circles.length; i++) {
                var distanceQuad = distanceQuadToElement(adapted.x, adapted.y, circles[i]);
                if(distanceQuad < minDistanceQuad) {
                    minDistanceQuad = distanceQuad;
                    nearestCircle = circles[i];
                }
            }

            // find circles near to nearest circles
            for (i = 0; i < circles.length; i++) {
                centerOfCircle = getCenterOfElement(circles[i]);
                var distanceQuad = distanceQuadToElement(centerOfCircle.x, centerOfCircle.y, nearestCircle);
                if(distanceQuad < 1) {
                    nearestCircles.push(circles[i]);
                }
            }

            return nearestCircles;
        }

        function mouseMoved(x, y) {
            var nearbySkillForlegends = getSkillDetectionForLegendFunction()(x, y);
            var skillStrList = createLegendSkillList(nearbySkillForlegends);
            updateLegend(skillStrList);

            svg.select("g.legend")
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
            var legend = svg.select("g.legend");
            legend.classed("on", false);
            legend.classed("off", true);
        }

        function showLegend() {
            var legend = svg.select("g.legend");
            legend.classed("off", false);
            legend.classed("on", true);
        }

        function appendLegend() {
            var legend = svg.append("g")
                .attr("class", "legend off");

            legend.append("rect")
                .attr("class", "legend")
                .attr("fill", "#ff00ff")
                .attr("width", 100)
                .attr("height", 100)
                .attr("stroke", "white")
                .attr("opacity", 0.8);

            legend.append("text")
                .attr("class", "legend")
                .attr("fill", "white");
        }

        function updateLegend(skillStrList) {
            var maxLength = funcs.getLongestString(skillStrList);

            var legendRect = svg.select("rect.legend");
            legendRect.transition()
                .attr("height", (skillStrList.length + 2) + "em")
                .attr("width", (maxLength + 1) * (2 / 3) + "em");

            var legendText = svg.select("text.legend");
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

        function removeQuadrants() {
            svg.select("g.quadrants").remove();
        }

        function createQuadrants() {
            var root = svg.select("g.root");

            var quadrantsEnter = root.selectAll("g.quadrants")
                .data(["quadrants"])
                .enter()
                .append("g")
                .attr("class", funcs.identity);

            quadrantsEnter.append("g")
                .attr("class", "axis xaxis")
                .attr("transform", "translate(0," + (height + 25) + ")");

            quadrantsEnter.append("g")
                .attr("class", "axis yaxis")
                .attr("transform", "translate(-25, 0)");

            quadrantsEnter.append("text")
                .attr("x", 0)
                .attr("y", height + 60)
                .attr("class", "x axis wcm-label")
                .text("Anzahl Mitarbeiter");

            var yLabelX = -60;
            var yLabelY = height;
            quadrantsEnter.append("text")
                .attr("x", yLabelX)
                .attr("y", yLabelY)
                .attr("class", "y axis wcm-label")
                .attr("transform", "rotate(270 " + yLabelX + "," + yLabelY + ")");

            var field = quadrantsEnter.append("g")
                .attr("class", "field")
                .attr("transform", "translate(0, 0)");

            appendLegend();

            field.append("text")
                .attr("text-anchor", "middle")
                .text("Weißer Fleck")
                .attr("class", "quad-label lower-left")
                .attr("x", xScalePercent(100 / 6))
                .attr("y", yScalePercent(100 / 6));

            field.append("text")
                .attr("text-anchor", "middle")
                .text("Einzelne Experten")
                .attr("class", "quad-label upper-left")
                .attr("x", xScalePercent(100 / 6))
                .attr("y", yScalePercent(100 / 6 * 5));

            field.append("text")
                .attr("text-anchor", "middle")
                .text("Viel Einäugige")
                .attr("class", "quad-label lower-right")
                .attr("x", xScalePercent(100 / 6 * 5))
                .attr("y", yScalePercent(100 / 6));

            field.append("text")
                .attr("text-anchor", "middle")
                .text("Hohe Kompetenzdichte")
                .attr("class", "quad-label upper-right")
                .attr("x", xScalePercent(100 / 6 * 5))
                .attr("y", yScalePercent(100 / 6 * 5));

            field.append("line")
                .attr("stroke-dasharray", "5,5")
                .attr("class", "divider horizontal")
                .attr("x1", 0)
                .attr("y1", yScalePercent(100 / 2 + 0.5))
                .attr("x2", xScalePercent(100))
                .attr("y2", yScalePercent(100 / 2 + 0.5));

            field.append("line")
                .attr("stroke-dasharray", "5,5")
                .attr("class", "divider vertical")
                .attr("x1", xScalePercent(100 / 2 + 0.5))
                .attr("y1", 0)
                .attr("x2", xScalePercent(100 / 2 + 0.5))
                .attr("y2", yScalePercent(0));
        }

        function updateGrid() {
            textLowerLeft.transition().duration(1000)
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
            var ya = getYAttribute();
            return skill[ya];
        }

        function radiusForSkill(skill) {
            return skill["Mittlere Skilldauer"] * 5;
        }

        function createXScale(maxX) {
            return d3.scale.linear()
                .domain([1, maxX])
                .range([0, width]);
        }

        function createYScale(maxY) {
            return d3.scale.linear()
                .domain([0, maxY])
                .range([height, 0]);
        }

        function updateAxes(maxX, maxY) {

            var xScale = createXScale(maxX);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .ticks(10)
                .orient("bottom");

            var yScale = createYScale(maxY);

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

            svg.select("text.y.axis")
                .transition()
                .text(getYAttribute());
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
            var ya = getYAttribute();
            switch(ya) {
                case "Mittlere Bewertung":
                    return 4;

                default:
                    return dl.max(data, funcs.createAccessorFunction(ya));
            }
        }

        function getYAttribute() {
            switch($routeParams.ya) {
                case "ec":
                    return "Anzahl Experten";

                default:
                    return "Mittlere Bewertung";
            }
        }

        function setYAttribute(ya) {
            switch(ya) {
                case "Anzahl Experten":
                    $location.search("ya", "ec");
                    break;

                default:
                    $location.search("ya", null);
            }
        }
        
        function switchYAttribute() {
            setYAttribute(input.ya);
            $timeout(function() {
                draw();
            });
        }

        function getMode() {
            switch($routeParams.mode) {
                case "v":
                    return MODE_VORONOI;

                case "t":
                    return MODE_TREEMAP;

                default:
                    return MODE_BUBBLES;
            }
        }

        function setMode(mode) {
            switch(mode) {
                case MODE_VORONOI:
                    $location.search("mode", "v");
                    break;

                case MODE_TREEMAP:
                    $location.search("mode", "t");
                    break;

                default:
                    $location.search("mode", null);
                    break;
            }
        }

        function draw() {
            switch(getMode()) {
                case MODE_VORONOI:
                    createQuadrants();
                    drawVoronoiSkills();
                    break;

                case MODE_TREEMAP:
                    removeQuadrants();
                    drawTreemapSkills("expertCount", true);
                    break;

                case MODE_BUBBLES:
                    createQuadrants();
                    drawSkills();
                    break;
            }
        }

        function getLegendDetectorRadius() {
            switch (getMode()) {
                case MODE_VORONOI:
                case MODE_TREEMAP:
                    return 0;

                case MODE_BUBBLES:
                    return 10;
            }
        }

        function drawVoronoiSkills() {
            function createLayers() {
                var layers = ["paths", "circles", "texts"];
                var root = svg.select("g.root");
                var field = root.select("g.field");
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
            var maxX = xMax(data);
            var maxY = yMax(data);
            var xScale = createXScale(maxX);
            var yScale = createYScale(maxY);

            updateAxes(maxX, maxY);
            createLayers();

            var filteredData = data.filter(function (d) {
                return funcs.isEmpty(input.skillNameFilter) || d["Skill"].toLowerCase().indexOf(input.skillNameFilter) > -1;
            });

            var vertices = filteredData.map(function (d) {
                var vert = [xScale(d["Anzahl Mitarbeiter"]), yScale(yScaleForSkill(d))];
                vert.skill = d["Skill"];
                vert.category = skills.categoryFromSkill(d);
                vert.ma = d["Mittlere Bewertung"];
                vert.md = d["Mittlere Skilldauer"];
                vert.count = d["Anzahl Mitarbeiter"];
                vert.ec = d["Anzahl Experten"];
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

            var root = svg.select("g.root");
            var field = root.select("g.field");
            var pathData = field.select("g.paths").selectAll("path.skill")
                .data(voronoiVerticesWithoutUndefines, polygon);

            pathData.exit().remove();

            // propagate downwards
            field.select("g.paths").selectAll("path.skill")
                .select("path.skill");

            pathData.enter().append("path")
                .attr("class", "skill forlegend")
                .attr("_skill", function (d) {
                    return d.point.skill;
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
                .attr("_count", function (d) {
                    return d.point.count;
                })
                .attr("_ec", function (d) {
                    return d.point.ec;
                })
                .attr("_ma", function (d) {
                    return d.point.ma;
                })
                .attr("_md", function (d) {
                    return d.point.md;
                })
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
                .attr("_count", function (d) {
                    return d.count;
                })
                .attr("_ec", function (d) {
                    return d.ec;
                })
                .attr("_ma", function (d) {
                    return d.ma;
                })
                .attr("_md", function (d) {
                    return d.md;
                })
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
                .attr("class", function () {
                    return "skill " + (shouldShowText() ? "on" : "off");
                })
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

        function shouldShowText() {
            return $scope.input.showText;
        }

        function hideText() {
            d3.selectAll("text.skill")
                .classed("on", false)
                .classed("off", true);
        }

        function showText() {
            d3.selectAll("text.skill")
                .classed("off", false)
                .classed("on", true);
        }

        function switchText() {
            if(shouldShowText()) {
                showText();
            }
            else {
                hideText();
            }
        }

        function resetRoot() {
            var root = svg.select("g.root");
            root.selectAll("g").remove();
        }

        function drawTreemapSkills(ya, withCategories) {
            var data = skills.recalcSkills(locations, categories);
            var filteredData = data.filter(function (d) {
                return funcs.isEmpty(input.skillNameFilter) || d["Skill"].toLowerCase().indexOf(input.skillNameFilter) > -1;
            });

            var skillTree;

            if(withCategories) {
                skillTree = skills.createTree(filteredData);
            }
            else {
                skillTree = skills.createFlatTree(filteredData);
            }

            var treemap = d3.layout.treemap()

                .size([width, height])
                .value(function(d) {
                    return d[ya];
                });

            var treemapData = treemap(skillTree);

            var root = svg.select("g.root");

            var cellData = root.selectAll("g.cell")
                .data(treemapData, function(d) {
                    return d.name;
                });

            var cellEnter = cellData
                .enter()
                .append("g")
                .attr("class", "cell");

            root.selectAll("g.cell")
                .transition().duration(1000)
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            // propagate downwards
            root.selectAll("g.cell").select("rect.skill");

            cellEnter.append("rect")
                .attr("class", function(d) {
                    var classes = "skill";
                    if(!d.children) {
                        classes += " forlegend";
                    }
                    return classes;
                })
                .attr("_skill", function(d) {
                    if(!d.children) {
                        return d.name;
                    }
                })
                .style("fill", function(d) {
                    if(withCategories) {
                        return d.children ? skills.categoryToColor(d.name) : skills.categoryToColor(d.category);
                    }
                    else {
                        return skills.categoryToColor(d.category);
                    }
                });

            // propagate downwards
            root.selectAll("g.cell").select("rect.skill");

            root.selectAll("rect.skill")
                .attr("_count", function(d) {
                    return d["count"];
                })
                .attr("_ec", function(d) {
                    return d["expertCount"];
                })
                .attr("_ma", function(d) {
                    return d["ma"];
                })
                .attr("_md", function(d) {
                    return d["md"];
                })
                .transition().duration(1000)
                .attr("width", function(d) {
                    return d.dx;
                })
                .attr("height", function(d) {
                    return d.dy;
                });

            cellEnter.append("text")
                .attr("class", "skill")
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .text(function(d) {
                    return d.children ? null : d.name;
                });

            // propagate downwards
            root.selectAll("g.cell").select("text.skill");

            root.selectAll("text.skill")
                .attr("x", function(d) {
                    return d.dx / 2;
                })
                .attr("y", function(d) {
                    return d.dy / 2;
                })
                .attr("font-size", function(d) {
                    var quotx = d.dx / d.name.length;
                    var quoty = d.dy / 2;
                    return Math.min(quotx, quoty) + "px";
                });

            cellData.exit().remove();
        }

        function drawSkills() {
            var data = skills.recalcSkills(locations, categories);
            var maxX = xMax(data);
            var maxY = yMax(data);
            var xScale = createXScale(maxX);
            var yScale = createYScale(maxY);

            updateAxes(maxX, maxY);

            var filteredData = data.filter(function (d) {
                return funcs.isEmpty(input.skillNameFilter) || d["Skill"].toLowerCase().indexOf(input.skillNameFilter) > -1;
            });

            var root = svg.select("g.root");
            var field = root.select("g.field");
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
                .transition().duration(1000)
                .attr("transform", function (d) {
                    return "translate(" + xScale(d["Anzahl Mitarbeiter"]) + "," + yScale(yScaleForSkill(d)) + ")";
                });

            var gSkillEnterG = gSkillEnter.append("g");

            gSkillEnterG.append("circle")
                .attr("class", "skill forlegend")
                .attr("opacity", "0.5")
                .attr("stroke", "grey")
                .attr("fill", function (d) {
                    var cat = skills.categoryFromSkill(d);
                    var color = skills.categoryToColor(cat);
                    return color;
                });

            gSkillEnterG.append("text")
                .attr("opacity", 0.5)
                .attr("class", function () {
                    return "wcm-label item skill " + (shouldShowText() ? "on" : "off");
                })
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
                .attr("_ec", function (d) {
                    return d["Anzahl Experten"];
                })
                .attr("_ma", function (d) {
                    return d["Mittlere Bewertung"];
                })
                .attr("_md", function (d) {
                    return d["Mittlere Skilldauer"];
                })
                .attr("_cat", skills.categoryFromSkill);

            gSkillData.exit().remove();
        }

        function skillNameFilterChanged() {
            draw();
        }

        function switchMode() {
            setMode(input.mode);
            $timeout(function () {
                resetRoot();
                draw();
            });
        }

        $scope.skillNameFilterChanged = skillNameFilterChanged;

        var input = {
            showText: true,
            mode: getMode(),
            ya: getYAttribute()
        };

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

            $scope.switchText = switchText;
            $scope.switchMode = switchMode;
            $scope.switchYAttribute = switchYAttribute;

            draw();
        });
    });