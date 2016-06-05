'use strict';

angular.module(com_geekAndPoke_coolg.moduleName)
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/stock', {
                templateUrl: 'js/views/stockView/stockView.html',
                controller: com_geekAndPoke_coolg.STOCK_CONTROLLER
            })
            .when('/skillTest', {
                templateUrl: 'js/views/skillView/skillTest.html',
                controller: com_geekAndPoke_coolg.SKILL_CONTROLLER_TEST
            })
            .otherwise({redirectTo: '/stock'});
    }])
    .run(function(dateUtil, funcs, dimensions, mathUtil, colorUtil) {
        bottle.factory("colorUtil", function () {
            return colorUtil;
        });
        bottle.factory('dateUtil', function() {
            return dateUtil;
        });
        bottle.factory('funcs', function() {
            return funcs;
        });
        bottle.factory('dimensions', function() {
            return dimensions;
        });
        bottle.factory('mathUtil', function() {
            return mathUtil;
        });
        bottle.factory("$datalib", function () {
            return dl;
        });
        bottle.factory("$tinycolor", function () {
            return tinycolor;
        });
        bottle.factory("$d3", function () {
            return d3;
        })
    });
