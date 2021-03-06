'use strict';

angular.module(com_geekAndPoke_coolg.moduleName)
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/stock', {
                templateUrl: 'js/views/stockView/stockView.html',
                controller: com_geekAndPoke_coolg.STOCK_CONTROLLER
            })
            .otherwise({redirectTo: '/stock'});
    }])
    .run(function(dateUtil, funcs, dimensions, mathUtil) {
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
    });
