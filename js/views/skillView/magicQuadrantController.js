'use strict';

com_eosItServices_Dep.MAGIC_QUADRANT_CONTROLLER = 'MagicQuadrantController';

angular.module(com_eosItServices_Dep.moduleName).controller(com_eosItServices_Dep.MAGIC_QUADRANT_CONTROLLER,
    function ($scope, $routeParams, $location, $timeout, $q, measureConstants, dimensions, AppContext) {
        var Skills = bottle.container.Skills;

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

        var width = (dimensions.screenDimensions.width - 50) * (8/12);
        var height = dimensions.screenDimensions.height - 70;
        var margin = {"left": 100, "bottom": 25, "right": 5};

        var svg = d3.select("#canvas")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "svg");

        svg.append("g")
            .attr("class", "axis xaxis")
            .attr("transform", "translate(" + (margin.left - 10) + "," + (height - 15) + ")");

        svg.append("g")
            .attr("class", "axis yaxis")
            .attr("transform", "translate(" + (margin.left - 10) + ", 10)");

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

        var quadrant_border = quadrant_group.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.bottom)
            .attr("rx", 20)
            .attr("ry", 20)
            .attr("class", "quadrant_border");

        function drawField(maxX, maxY) {

            var xScale = d3.scale.linear()
                .domain([0, maxX])
                .range([0, width - margin.left - margin.right]);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .ticks(0)
                .orient("bottom");

            var yScale = d3.scale.linear()
                .domain([0, maxY])
                .range([height - margin.bottom, 0]);

            var yAxis = d3.svg.axis()
                .scale(yScale)
                .ticks(0)
                .orient("left");

            svg.select(".xaxis")
                .transition()
                .call(xAxis);

            svg.select("yaxis")
                .transition()
                .call(yAxis);

            (function createGrid() {
                // Small effort
                quadrant_group.append("text")
                    .attr("x", xScale(maxX/6))
                    .attr("y", yScale(maxY/6))
                    .attr("text-anchor", "middle")
                    .text("Kann man mitnehmen")
                    .attr("class", "quad-label");

                quadrant_group.append("text")
                    .attr("x", xScale(maxX/6))
                    .attr("y", yScale(maxY/2))
                    .attr("text-anchor", "middle")
                    .text("Sollte man mitnehmen")
                    .attr("class", "quad-label");

                quadrant_group.append("text")
                    .attr("x", xScale(maxX/6))
                    .attr("y", yScale(maxY/6 * 5))
                    .attr("text-anchor", "middle")
                    .text("Muss man mitnehmen")
                    .attr("class", "quad-label");

                // Middle effort
                quadrant_group.append("text")
                    .attr("x", xScale(maxX/2))
                    .attr("y", yScale(maxY/6))
                    .attr("text-anchor", "middle")
                    .text("Eher nicht")
                    .attr("class", "quad-label");

                quadrant_group.append("text")
                    .attr("x", xScale(maxX/2))
                    .attr("y", yScale(maxY/2))
                    .attr("text-anchor", "middle")
                    .text("Vielleicht")
                    .attr("class", "quad-label");

                quadrant_group.append("text")
                    .attr("x", xScale(maxX/2))
                    .attr("y", yScale(maxY/6 * 5))
                    .attr("text-anchor", "middle")
                    .text("Wahrscheinlich")
                    .attr("class", "quad-label");

                // Big effort
                quadrant_group.append("text")
                    .attr("x", xScale(maxX/6 * 5))
                    .attr("y", yScale(maxY/6))
                    .attr("text-anchor", "middle")
                    .text("Auf gar keinen Fall")
                    .attr("class", "quad-label");

                quadrant_group.append("text")
                    .attr("x", xScale(maxX/6 * 5))
                    .attr("y", yScale(maxY/2))
                    .attr("text-anchor", "middle")
                    .text("Auf keinen Fall")
                    .attr("class", "quad-label");

                quadrant_group.append("text")
                    .attr("x", xScale(maxX/6 * 5))
                    .attr("y", yScale(maxY/6 * 5))
                    .attr("text-anchor", "middle")
                    .text("Kann man überlegen")
                    .attr("class", "quad-label");

                // Must
                quadrant_group.append("rect")
                    .attr("x", 0)
                    .attr("y", yScale(maxY))
                    .attr("width", xScale(maxX))
                    .attr("height", yScale(maxY * 0.95))
                    .attr("rx", 20)
                    .attr("ry", 20)
                    .attr("fill", "grey")
                    .attr("opacity", "0.3");

                quadrant_group.append("text")
                    .attr("x", xScale(1))
                    .attr("y", yScale(97))
                    .attr("text-anchor", "left")
                    .attr("class", "quad-label")
                    .text("Muss-Anforderung");

                // creating the dividers
                quadrant_group.append("line")
                    .attr("x1", 0)
                    .attr("y1", yScale(33))
                    .attr("x2", xScale(100))
                    .attr("y2", yScale(33))
                    .attr("class", "divider");

                quadrant_group.append("line")
                    .attr("x1", 0)
                    .attr("y1", yScale(66))
                    .attr("x2", xScale(100))
                    .attr("y2", yScale(66))
                    .attr("class", "divider");

                quadrant_group.append("line")
                    .attr("x1", xScale(33))
                    .attr("y1", 0)
                    .attr("x2", xScale(33))
                    .attr("y2", yScale(0))
                    .attr("class", "divider");

                quadrant_group.append("line")
                    .attr("x1", xScale(66))
                    .attr("y1", 0)
                    .attr("x2", xScale(66))
                    .attr("y2", yScale(0))
                    .attr("class", "divider");
            })();
        }

        function yScaleForSkill(skill) {
            return skill.benefit;
        }

        function radiusFromRiskText(risk) {
            var radius = 10;

            switch (risk) {
                case measureConstants.C.RISK_LOW:
                    radius = 30;
                    break;

                case measureConstants.C.RISK_MIDDLE:
                    radius = 20;
                    break;

                case measureConstants.C.RISK_HIGH:
                    radius = 10;
                    break;

                default:
                    radius = 20;
            }

            return radius;
        }

        /* **************
         * Filter
         * *************/

        function isCategoryHidden(category) {
            return ($routeParams["h_" + category] == "y");
        }

        function switchCategory(category) {
            if(isCategoryHidden(category)) {
                $location.search("h_" + category, "n");
            }
            else {
                $location.search("h_" + category, "y");
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

            function iconClass(selection) {
                selection
                    .attr("class", function (d) {
                        switch(getMode()) {
                            case MODE_SE_ONLY:
                                return "circle category item " + d.category + " id" + d.id;

                            default:
                                return "circle " + d.type + " id" + d.id;
                        }
                    });
            }

            var gSkill = quadrant_group.selectAll("g.skill")
                .data(skills.values)
                .enter()
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
                    return radiusFromRiskText(d.risk);
                })
                .attr("fill", function(d) {
                    var color = measureMetadata.getColorForEnumValue(measureConstants.C.MEASURE_TYPE_NAME, d.type);
                    return color;
                })
                .call(iconClass)
                .call(mouseHandlingOnIcon);

            gMeasureA.append("title")
                .text(function(d) {
                    return d.description;
                });

            gMeasureA.append("text")
                .attr("opacity", 1)
                .attr("class", function (d) {
                    return "wcm-label item cat-" + d;
                })
                .attr("y", 0)
                .attr("x", 0)
                .text(function (d) {
                    return d;
                })
                .on("click", function (d) {
                    d3.select(".circle-hover").classed("circle-hover", false);
                    d3.select("circle.cat-" + d).classed("circle-hover", true);
                    setCurrentAttributes(d);
                });
        }

        skills.ready.then(function() {
            $scope.switchCategory = switchCategory;

            $scope.getColorForCategory = skills.categoryToColor;

            // Hide buttons
            $scope.hideButtons = $routeParams.hb;

            $scope.allCategories = skills.categories;
            $scope.categorySwitchModel = {};
            $scope.allCategories.forEach(function(category) {
                $scope.categorySwitchModel[category] = !isCategoryHidden(category);
            });

            if(getMode() == MODE_RS) {
                drawSkills(measureConstants.C.MEASURE_TYPE_RS);
            }
            else {
                drawSkills(measureConstants.C.MEASURE_TYPE_TECHNICAL);
                if(getMode() != MODE_SE_ONLY) {
                    drawSkills(measureConstants.C.MEASURE_TYPE_BUSINESS);
                    drawSkills(measureConstants.C.MEASURE_TYPE_SECURITY);
                    drawSkills(measureConstants.C.MEASURE_TYPE_RUN);
                }
            }

            clearCurrentAttributes();
        });
    });