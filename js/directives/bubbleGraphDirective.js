'use strict';

angular.module(com_geekAndPoke_coolg.moduleName).directive("bubbleGraph", function() {
    var funcs = bottle.container.funcs;
    var BubbleGraph = bottle.container.bubbleGraph;

    function link() {
        var bubbleGraph = new BubbleGraph(scope.data, scope.x, scope.y, scope.color, scope.bubble);
    }

    return {
        link: link,
        scope: {
            data: "=",
            x: "@",
            y: "@",
            color: "@",
            size: "@",
            bubble: "@"
        }
    }
});
