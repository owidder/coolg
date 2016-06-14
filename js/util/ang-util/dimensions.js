'use strict';

angular.module(com_geekAndPoke_coolg.moduleName).factory('dimensions', function(funcs) {
    function width(w) {
        var _width;

        if(!funcs.isSet(w)) {
            _width = $(window).width();
        }
        else  {
            _width = $(window).width() + parseInt(w);
        }

        return _width;
    }

    function height(h) {
        var _height;

        if(!funcs.isSet(h)) {
            _height = $(window).height();
        }
        else {
            _height = $(window).height() + parseInt(h);
        }

        return _height;
    }

    return {
        width: width,
        height: height
    }
});
