'use strict';

angular.module(com_geekAndPoke_coolg.moduleName).factory('dimensions', function(funcs) {
    function width(w) {
        var _width = window.innerWidth;

        if(funcs.isSet(w)) {
            _width += parseInt(w);
        }

        return _width;
    }

    function height(h) {
        var _height = window.innerHeight;

        if(funcs.isSet(h)) {
            _height += parseInt(h);
        }

        return _height;
    }

    return {
        width: width,
        height: height
    }
});
