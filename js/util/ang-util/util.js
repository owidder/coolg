'use strict';

angular.module(com_geekAndPoke_coolg.moduleName).factory('util', function (funcs) {
    function createUrlParameters($location, obj, prefix) {
        if (!funcs.isDefined(prefix)) {
            prefix = '';
        }
        funcs.forEachKeyAndVal(obj, function(k, v) {
            $location.search(prefix + k, v);
        });
    }


    return {
        createUrlParameters: createUrlParameters
    };
});
