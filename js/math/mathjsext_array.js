'use strict';

(function () {

    function zero2DimArray(dim1, dim2, zeroArray) {
        if(!(dim2 > 0)) {
            dim2 = dim1;
        }
        if(typeof (zeroArray) == 'undefined') {
            zeroArray = [];
        }
        else if(zeroArray.constructor.name == 'Array') {
            zeroArray.length = 0;
        }
        var i, j;
        for(i = 0; i < dim1; i++) {
            zeroArray.push([]);
            for(j = 0; j < dim2; j++) {
                zeroArray[i].push(0);
            }
        }

        return zeroArray;
    }
    
    function matrixSum(matrix) {
        var sum = 0;
        matrix.map(function(arr) {
            sum += arr.reduce(function(a, b) {
                return a + b;
            })
        });

        return sum;
    }

    math.import({
        zero2DimArray: zero2DimArray,
        matrixSum: matrixSum
    });
})();