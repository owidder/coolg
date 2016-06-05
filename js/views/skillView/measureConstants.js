'use strict';

angular.module(com_eosItServices_Dep.moduleName).factory("measureConstants", function() {

    var C = {
        CATEGORY_FRAMEWORK: "Framework",
        CATEGORY_REFACTORING: "Refactoring",
        CATEGORY_BUILD_DEPLOY: "Build-Deploy",
        CATEGORY_RUN: "Betrieb",
        CATEGORY_SECURITY: "Security",
        CATEGORY_DATAMODEL: "Datenmodell",

        TEAM_FW: "FW",
        TEAM_ES: "ES",
        TEAM_PI: "PI",
        TEAM_PP: "PP",
        TEAM_PB: "PB",
        TEAM_PS: "PS",

        RISK_NAME: "risk",

        RISK_LOW: "Gut",
        RISK_MIDDLE: "Mittel",
        RISK_HIGH: "Schlecht",

        ORG_AP: "AP",
        ORG_AO: "AO",
        ORG_SE: "SE",
        ORG_SM: "SM",

        MEASURE_TYPE_NAME: "type",

        MEASURE_TYPE_TECHNICAL: "T",
        MEASURE_TYPE_BUSINESS: "F",
        MEASURE_TYPE_SECURITY: "S",
        MEASURE_TYPE_RUN: "B",
        MEASURE_TYPE_RS: "RS", /* deprecated */

        EFFORT_NAME: "effort",

        EFFORT_LOW: {
            id: "klein",
            text: "1 (klein)"
        },
        EFFORT_LOW_TO_MEDIUM: {
            text: "2 (klein - mittel)",
            id: "klein_mittel"
        },
        EFFORT_MEDIUM: {
            text: "3 (mittel)",
            id: "mittel"
        },
        EFFORT_MEDIUM_TO_HIGH: {
            text: "4 (mittel - hoch)",
            id: "mittel_hoch"
        },
        EFFORT_HIGH: {
            text: "5 (hoch)",
            id: "hoch"
        },

        WEIGHT_NAME: "weight",

        WEIGHT_RISK: {
            id: "Risiko",
            text: "Gewicht Risiko"
        },
        WEIGHT_EFFORT: {
            id: "Aufwand",
            text: "Gewicht Aufwand"
        },
        WEIGHT_BENEFIT: {
            id: "Nutzen",
            text: "Gewicht Nutzen"
        },

        FACTOR_NAME: "factor",

        BENEFIT_NAME: "benefit"
    };

    var RISKS = [C.RISK_LOW, C.RISK_MIDDLE, C.RISK_HIGH];

    var MEASURE_TYPES = [C.MEASURE_TYPE_SECURITY, C.MEASURE_TYPE_BUSINESS, C.MEASURE_TYPE_TECHNICAL, C.MEASURE_TYPE_RUN];

    var CATEGORIES = [
        C.CATEGORY_FRAMEWORK,
        C.CATEGORY_REFACTORING,
        C.CATEGORY_BUILD_DEPLOY,
        C.CATEGORY_RUN,
        C.CATEGORY_SECURITY,
        C.CATEGORY_DATAMODEL
    ];

    var ORGS = [
        C.ORG_AP,
        C.ORG_AO,
        C.ORG_SE,
        C.ORG_SM
    ];

    var EFFORT_CLUSTERS = [C.EFFORT_LOW, C.EFFORT_LOW_TO_MEDIUM, C.EFFORT_MEDIUM, C.EFFORT_MEDIUM_TO_HIGH, C.EFFORT_HIGH];

    var WEIGHTS = [C.WEIGHT_BENEFIT, C.WEIGHT_EFFORT, C.WEIGHT_RISK];

    return {
        C: C,
        RISKS: RISKS,
        MEASURE_TYPES: MEASURE_TYPES,
        CATEGORIES: CATEGORIES,
        ORGS: ORGS,
        EFFORT_CLUSTERS: EFFORT_CLUSTERS,
        WEIGHTS: WEIGHTS
    }
});