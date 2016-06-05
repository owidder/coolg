'use strict';

com_eosItServices_Dep.MAGIC_QUADRANT_CONTROLLER = 'MagicQuadrantController';

angular.module(com_eosItServices_Dep.moduleName).controller(com_eosItServices_Dep.MAGIC_QUADRANT_CONTROLLER,
    function ($scope, $routeParams, $location, $timeout, $q, measureConstants, dimensions, AppContext) {
        var Skills = bottle.container.Skills;

        var MODE_SE_ONLY = "MODE_SE_ONLY";
        var MODE_RS = "MODE_RS"; /* deprecates: Run + Security */
        var MODE_ALL = "MODE_ALL";

        var measureData = AppContext.measureData;
        var measureMetadata = AppContext.measureMetadata;

        var currentAttributes = [];

        var skills = new Skills();

        function getMode() {
            switch($routeParams.m) {
                case "se":
                    return MODE_SE_ONLY;

                case "rs":
                    return MODE_RS;

                default:
                    return MODE_ALL;
            }
        }

        function clearCurrentAttributes() {
            $timeout(function() {
                currentAttributes = [];
            });
        }

        function setCurrentAttributes(measure) {
            $timeout(function() {
                currentAttributes = measureMetadata.getAttributesForMeasure(measure);
                $scope.attributes = currentAttributes;
                $scope.attributesShowInList = $scope.attributes.filter(function(e) {
                    return e.showInList;
                });
            });
        }

        // global variables
        var width = (dimensions.screenDimensions.width - 50) * (8/12);
        var height = dimensions.screenDimensions.height - 70;
        var margin = {"left": 100, "bottom": 25, "right": 5};

        // x scale
        var xScale = d3.scale.linear()
            .domain([0, 100])
            .range([0, width - margin.left - margin.right]);

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .ticks(0)
            .orient("bottom");

        // y scale
        var yScale = d3.scale.linear()
            .domain([0, 100])
            .range([height - margin.bottom, 0])

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .ticks(0)
            .orient("left");

        // creating the main svg
        var svg = d3.select("#canvas")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "svg");

        // axis and axis description
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + (margin.left - 10) + "," + (height - 15) + ")")
            .call(xAxis);

        var xLabel = svg.append("text")
            .attr("x", 100)
            .attr("y", height - 2)
            .attr("class", "axis wcm-label")
            .text("Aufwand");

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + (margin.left - 10) + ", 10)")
            .call(yAxis);

        var yLabelX = margin.left - 15;
        var yLabelY = height - 75;
        var yLabel = svg.append("text")
            .attr("x", yLabelX)
            .attr("y", yLabelY)
            .attr("class", "axis wcm-label")
            .text("Nutzen")
            .attr("transform", "rotate(270 " + yLabelX + "," + yLabelY + ")");

        /*************************
         * Legend
         *************************/

        function createRiskParam(risk) {
            return "h_" + risk;
        }

        function clickOnRisk(risk) {
            if(filterMeasureOnRisk(risk)) {
                $timeout(function() {
                    $location.search(createRiskParam(risk), "y");
                })
            }
            else {
                $timeout(function() {
                    $location.search(createRiskParam(risk), "n");
                })
            }
        }

        // Risk
        (function createLegendRisk() {
            var LEGEND_RISK_MARGIN = 20;

            var legendRisk = svg.append("g")
                .attr("transform", "translate(0, " + yScale(95) + ")");


            legendRisk.append("text")
                .text("Risiko");

            var y = LEGEND_RISK_MARGIN;
            var legendRiskG = legendRisk.selectAll(".legend-risk-g")
                .data(measureConstants.RISKS.slice().reverse())
                .enter()
                .append("g")
                .attr("class", ".legend-risk-g")
                .attr("transform", function(d) {
                    var oldY = y;
                    var radius = radiusFromRiskText(d);
                    y += (radius * 2 + LEGEND_RISK_MARGIN);
                    return "translate(" + radius + ", " + oldY + ")";
                });

            legendRiskG.append("circle")
                .attr("class", function(d) {
                    return "legend " + (filterMeasureOnRisk(d) ? "hideOff" : "hideOn");
                })
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", function(d) {
                    return radiusFromRiskText(d);
                })
                .on("click", function(d) {
                    clickOnRisk(d);
                });

            legendRiskG.append("text")
                .attr("class", "legendText")
                .attr("x", 0)
                .attr("y", 0)
                .text(function(d) {
                    return d;
                })
                .on("click", function(d) {
                    clickOnRisk(d.id);
                });
        })();

        var quadrant_group;
        (function createGrid() {
            quadrant_group = svg.append("g")
                .attr("transform", "translate(" + margin.left + ",0)");

            var quadrant_border = quadrant_group.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width - margin.left - margin.right)
                .attr("height", height - margin.bottom)
                .attr("rx", 20)
                .attr("ry", 20)
                .attr("class", "quadrant_border");

            // Small effort
            quadrant_group.append("text")
                .attr("x", xScale(16))
                .attr("y", yScale(16))
                .attr("text-anchor", "middle")
                .text("Kann man mitnehmen")
                .attr("class", "quad-label");

            quadrant_group.append("text")
                .attr("x", xScale(16))
                .attr("y", yScale(50))
                .attr("text-anchor", "middle")
                .text("Sollte man mitnehmen")
                .attr("class", "quad-label");

            quadrant_group.append("text")
                .attr("x", xScale(16))
                .attr("y", yScale(83))
                .attr("text-anchor", "middle")
                .text("Muss man mitnehmen")
                .attr("class", "quad-label");

            // Middle effort
            quadrant_group.append("text")
                .attr("x", xScale(50))
                .attr("y", yScale(16))
                .attr("text-anchor", "middle")
                .text("Eher nicht")
                .attr("class", "quad-label");

            quadrant_group.append("text")
                .attr("x", xScale(50))
                .attr("y", yScale(50))
                .attr("text-anchor", "middle")
                .text("Vielleicht")
                .attr("class", "quad-label");

            quadrant_group.append("text")
                .attr("x", xScale(50))
                .attr("y", yScale(83))
                .attr("text-anchor", "middle")
                .text("Wahrscheinlich")
                .attr("class", "quad-label");

            // Big effort
            quadrant_group.append("text")
                .attr("x", xScale(83))
                .attr("y", yScale(16))
                .attr("text-anchor", "middle")
                .text("Auf gar keinen Fall")
                .attr("class", "quad-label");

            quadrant_group.append("text")
                .attr("x", xScale(83))
                .attr("y", yScale(50))
                .attr("text-anchor", "middle")
                .text("Auf keinen Fall")
                .attr("class", "quad-label");

            quadrant_group.append("text")
                .attr("x", xScale(83))
                .attr("y", yScale(83))
                .attr("text-anchor", "middle")
                .text("Kann man überlegen")
                .attr("class", "quad-label");

            // Must
            quadrant_group.append("rect")
                .attr("x", 0)
                .attr("y", yScale(100))
                .attr("width", xScale(100))
                .attr("height", yScale(95))
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

        function yScaleForMeasure(measure) {
            return measure.benefit;
        }

        function isRanked(measure) {
            return (yScaleForMeasure(measure) > 0);
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

        function filterMeasureOnRisk(riskId) {
            return ($routeParams[createRiskParam(riskId)] != "y");
        }

        function filterUnrankedMeasure(measure) {
            return !AppContext.measureData.isHideUnranked() || isRanked(measure);
        }

        function filterMeasures(measures) {
            return measures.filter(function(m) {
                return filterUnrankedMeasure(m) && filterMeasureOnRisk(m.risk);
            });
        }

        function isCategoryHidden(category) {
            return ($routeParams["h_" + category] == "y");
        }

        function switchCategorie(category) {
            if(isCategoryHidden(category)) {
                $location.search("h_" + category, "n");
            }
            else {
                $location.search("h_" + category, "y");
            }
        }

        /**
         * draw the matrix and circles
         * @param type
         */
        function drawMeasures(type) {
            if(AppContext.measureData.isMeasureTypeHidden(type)) {
                return;
            }
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

            var measures = measureData.getMeasures(type);
            var gMeasure = quadrant_group.selectAll("g.measure-" + type)
                .data(filterMeasures(measures))
                .enter()
                .append("g")
                .attr("class", "measure-" + type);

            gMeasure
                .transition()
                .attr("transform", function (d) {
                    return "translate(" + xScale(d.effort) + "," + yScale(yScaleForMeasure(d)) + ")";
                });

            var gMeasureA = gMeasure.append("svg:a")
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
                    return "wcm-label item id" + d.id + " " + (isRanked(d) ? "ranked" : "not-ranked");
                })
                .attr("y", 0)
                .attr("x", 0)
                .text(function (d) {
                    return d.name;
                })
                .on("click", function (d) {
                    d3.select(".circle-hover").classed("circle-hover", false);
                    d3.select("circle.id" + d.id).classed("circle-hover", true);
                    setCurrentAttributes(d);
                });
        }

        $q.all([measureData.initialized, measureMetadata.initialized]).then(function() {
            $scope.switchMeasureType = switchCategorie;

            $scope.getColorForEnumValue = measureMetadata.getColorForEnumValue;

            // Hide buttons
            $scope.hideButtons = $routeParams.hb;

            $scope.allCategories = measureMetadata.getAllEnumValues(measureConstants.C.MEASURE_TYPE_NAME);
            $scope.typeSwitchModel = {};
            $scope.allTypes.forEach(function(type) {
                $scope.typeSwitchModel[type.id] = !AppContext.measureData.isMeasureTypeHidden(type.id);
            });

            $scope.MEASURE_TYPES = measureConstants.MEASURE_TYPES;
            $scope.measureTypes = {};
            measureConstants.MEASURE_TYPES.forEach(function(measureType) {
                $scope.measureTypes[measureType] = !AppContext.measureData.isMeasureTypeHidden(measureType);
            });

            if(getMode() == MODE_RS) {
                drawMeasures(measureConstants.C.MEASURE_TYPE_RS);
            }
            else {
                drawMeasures(measureConstants.C.MEASURE_TYPE_TECHNICAL);
                if(getMode() != MODE_SE_ONLY) {
                    drawMeasures(measureConstants.C.MEASURE_TYPE_BUSINESS);
                    drawMeasures(measureConstants.C.MEASURE_TYPE_SECURITY);
                    drawMeasures(measureConstants.C.MEASURE_TYPE_RUN);
                }
            }

            clearCurrentAttributes();
        });
    });