'use strict';

bottle.factory("context", function (container) {
    var Field = container.Field;

    return {
        field: new Field()
    }
});
