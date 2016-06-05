'use strict';

angular.module(com_eosItServices_Dep.moduleName).factory("MeasureData", function ($http, $q, $routeParams, $location, funcs, measureConstants, iteraplan) {

    return function() {
        var that = this;

        var C = measureConstants.C;

        var effortCosts = {};
        var riskCosts = {};
        var shares = {};
        var weights = {};

        function getEffortCluster(effort) {
            if (effort < 30) {
                return C.EFFORT_LOW;
            }
            if (effort < 35) {
                return C.EFFORT_LOW_TO_MEDIUM;
            }
            if (effort < 63) {
                return C.EFFORT_MEDIUM;
            }
            if (effort < 70) {
                return C.EFFORT_MEDIUM_TO_HIGH;
            }
            return C.EFFORT_HIGH;
        }

        function getMeasuresOrderedAfterDistances(type) {
            var unorderedMeasures = getMeasures(type);
            var orderedMeasures = unorderedMeasures.slice().sort(function(a, b) {
                var distanceA = getDistance(a);
                var distanceB = getDistance(b);

                if(distanceA < distanceB) {
                    return -1;
                }

                if (distanceA > distanceB) {
                    return 1;
                }

                return 0;
            });

            return orderedMeasures;
        }

        function isMeasureTypeHidden(measureTypeId) {
            return ($routeParams["h_" + measureTypeId] == "y");
        }

        // if true, hide all not ranked measures
        function isHideUnranked() {
            return ($routeParams.hu == "y");
        }

        function switchMeasureType(measureTypeId) {
            if(isMeasureTypeHidden(measureTypeId)) {
                $location.search("h_" + measureTypeId, "n");
            }
            else {
                $location.search("h_" + measureTypeId, "y");
            }
        }

        function makeParamName(paramType, id) {
            return (paramType + "." + id);
        }

        function urlParamNameFromParamName(paramName) {
            return "p_" + paramName;
        }

        function getUrlParameter(paramType, id, defaultValue) {
            var param = $routeParams[urlParamNameFromParamName(makeParamName(paramType, id))];
            var value = (funcs.isDefined(param) ? param : defaultValue);
            return parseInt(value);
        }

        function getParameter(paramType, id) {
            var defaultValue = "";
            var configObject = that.metadata.getEnumEntry(measureConstants.C.FACTOR_NAME, makeParamName(paramType, id));
            if(funcs.isDefined(configObject)) {
                defaultValue = configObject.description;
            }

            return getUrlParameter(paramType, id, defaultValue);
        }

        function getShareByTypeId(typeId) {
            return getParameter(measureConstants.C.MEASURE_TYPE_NAME, typeId);
        }

        function getShareByType(type) {
            return getShareByTypeId(type.id);
        }

        function getCostOfMeasure(measure) {
            return measure.effort;
        }

        function getRiskCostOfMeasure(measure) {
            return getParameter(measureConstants.C.RISK_NAME, measure.risk);
        }

        /**
         *
         * @param measure
         * @returns {number} 1 = best benefit
         */
        function getBenefitRank(measure) {
            var orderedMeasuresOfType = measuresOrderedAfterBenefit[measure.type];
            var rank = funcs.searchForIndexOfObjectInArray(orderedMeasuresOfType, measure.benefit, measureConstants.C.BENEFIT_NAME);

            return rank;
        }

        function getCostRank(measure) {
            var orderedMeasuresOfType = measuresOrderedAfterCost[measure.type];
            var rank = funcs.searchForIndexOfObjectInArray(orderedMeasuresOfType, measure.effort, measureConstants.C.EFFORT_NAME);

            return rank;
        }

        function getMust(measure) {
            return (measure.must == "ja");
        }

        function getDistance(measure) {
            if(getMust(measure)) {
                return 0;
            }

            var riskCost = getRiskCostOfMeasure(measure);
            var costRank = getCostRank(measure);
            var benefitRank = getBenefitRank(measure);
            var costBenefit = Math.sqrt((costRank*costRank) + (benefitRank * benefitRank));
            var costBenefitRisk = Math.sqrt((costBenefit*costBenefit) + (riskCost*riskCost));

            return costBenefitRisk;
        }

        var measures;
        var measuresOrderedAfterBenefit;
        var measuresOrderedAfterCost;

        function addMeasure(measure) {
            measure.effortCluster = getEffortCluster(measure.effort);
            var type = measure.type;
            if(!funcs.isDefined(measures[type])) {
                measures[type] = [];
            }
            measures[type].push(measure);
        }

        function getMeasures(type) {
            return measures[type];
        }

        function fillMeasures(measureListFromResult) {
            function fillMeasuresOrderedAfterBenefit() {
                measuresOrderedAfterBenefit = {};
                measuresOrderedAfterCost = {};
                funcs.forEachKeyAndVal(measures, function(type, measureList) {
                    var DESCENDING = true;
                    measuresOrderedAfterBenefit[type] = funcs.sortArray(measureList, measureConstants.C.BENEFIT_NAME, DESCENDING);
                    measuresOrderedAfterCost[type] = funcs.sortArray(measureList, measureConstants.C.EFFORT_NAME);
                });
            }

            measures = {};
            measureListFromResult.forEach(function (measureFromResult) {
                function attributeValue(value) {
                    if(funcs.isArray(value)) {
                        if(value.length > 0) {
                            return value[0];
                        }
                        else {
                            return undefined;
                        }
                    }
                    else {
                        return value;
                    }
                }

                var measure = {};
                funcs.forEachKeyAndVal(measureFromResult, function(attributeName, value) {
                    var attrVal = attributeValue(value);
                    if(funcs.isDefined(attrVal)) {
                        measure[attributeName] = attributeValue(value);
                    }
                });
                addMeasure(measure);
            });

            fillMeasuresOrderedAfterBenefit();
        }

        var deferred = $q.defer();
        iteraplan.callApi("/api/data/Projekt").then(function(result) {
            fillMeasures(result);
            deferred.resolve();
        });

        this.initialized = deferred.promise;
        this.measures = measures;
        this.getMeasures = getMeasures;

        this.getParameter = getParameter;
        this.isMeasureTypeHidden = isMeasureTypeHidden;
        this.switchMeasureType = switchMeasureType;
        this.isHideUnranked = isHideUnranked;
        this.getShareByTypeId = getShareByTypeId;
        this.getShareByType = getShareByType;
        this.getCostOfMeasure = getCostOfMeasure;
        this.getMeasuresOrderedAfterDistances = getMeasuresOrderedAfterDistances;
        this.makeParamName = makeParamName;
        this.urlParamNameFromParamName = urlParamNameFromParamName;
    };
});