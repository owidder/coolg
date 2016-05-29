'use strict';

bottle.factory("bubbleGraph", function (container) {
    var funcs = bottle.container.funcs;

    function BubbleGraph(data, x, y, color, size, bubble) {
        var that = this;

        that.data = data;
        that.x = x;
        that.y = y;
        that.color = color;
        that.size = size;
        that.bubble = bubble;

    }

    return BubbleGraph;
});