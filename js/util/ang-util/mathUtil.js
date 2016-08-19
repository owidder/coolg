'use strict';

angular.module(com_geekAndPoke_coolg.moduleName).factory("mathUtil", function() {

    function hexToDec(hex) {
        return parseInt(hex, 16).toString(10);
    }

    /**
     *
     * @param n number to rount
     * @param p precision (number of digits right to the point)
     */
    function round(n, p) {
        var factor = Math.pow(10, p);
        return Math.round(n * factor) / factor;
    }

    function randomIntBetween(lower, upper) {
        var rand = Math.random() * (upper - lower) + lower;
        return Math.trunc(rand);
    }

    return {
        hexToDec: hexToDec,
        round: round,
        randomIntBetween: randomIntBetween
    }
});