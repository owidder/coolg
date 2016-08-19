'use strict';

com_geekAndPoke_coolg.PICI_CONTROLLER = "piciController";

angular.module(com_geekAndPoke_coolg.moduleName).controller(com_geekAndPoke_coolg.PICI_CONTROLLER, function($timeout) {
    var dimensions  = bottle.container.dimensions;
    var funcs  = bottle.container.funcs;
    var mathUtil = bottle.container.mathUtil;

    var width = dimensions.width(-50);
    var height = dimensions.height(-70);

    function relativeBoundingRect(element, relativeToSelector) {
        var relativeToBoundingRect = document.querySelector(relativeToSelector).getBoundingClientRect();
        var boundingRect = element.getBoundingClientRect();
        var relativeBoundingRect = {
            width: boundingRect.width,
            height: boundingRect.height,
            left: boundingRect.left - relativeToBoundingRect.left,
            top: boundingRect.top - relativeToBoundingRect.top,
            bottom: boundingRect.bottom - relativeToBoundingRect.bottom,
            right: boundingRect.right - relativeToBoundingRect.right
        };

        return relativeBoundingRect;
    }

    function computeArea(element) {
        var rect = element.getBoundingClientRect();
        return rect.width * rect.height;
    }

    function addAreaToMap(clazz, area, areaMap) {
        if(isNaN(areaMap[clazz])) {
            areaMap[clazz] = 0;
        }

        areaMap[clazz] += area;
    }

    function computeAreaMap() {
        var areaMap = {};

        d3.selectAll("svg > path")
            .attr("class", function() {
                var clazz = this.getAttribute("class");
                return clazz + " picipath";
            })
            .each(function() {
                var area = computeArea(this);
                var clazz = this.getAttribute("class");
                addAreaToMap(clazz, area, areaMap);
            });

        return areaMap;
    }

    function createFlatTreeFromAreaMap(areaMap) {
        var flatTree = {
            name: "root",
            children: [],
            indexes: {}
        };

        funcs.forEachKeyAndVal(areaMap, function(clazz, area) {
            flatTree.indexes[clazz] = flatTree.children.length;
            flatTree.children.push({
                name: clazz,
                area: area
            });
        });

        return flatTree;
    }

    function createTreeMapDataFromFlatTree(flatTree) {
        var treeMap = d3.layout.treemap()
            .size([width, height])
            .value(function(d) {
                return d.area
            });

        var treeMapData = treeMap(flatTree);

        return treeMapData;
    }

    function createRectPath(x, y, dx, dy) {
        return "M" + x + " " + y + " H " + (x + dx) + " V " + (y + dy) + " H " + x + " Z";
    }

    function createCirclePath(cx, cy, r) {
        return "M " + cx + " " + cy + " m " + (-1 * r) +
            ", 0 a " + r + "," + r + " 0 1,0 " + (r * 2) +
            ",0 a " + r + "," + r + " 0 1,0 " + (-2 * r) + ",0";
    }

    function createPaths(flatTree) {
        d3.selectAll(".picipath")
            .each(function() {
                var clazz = this.getAttribute("class");
                var nodeIndex = flatTree.indexes[clazz];
                var treeNode = flatTree.children[nodeIndex];
                var rectPath = createRectPath(treeNode.x, treeNode.y, treeNode.dx, treeNode.dy);
                var cx = treeNode.x + (treeNode.dx / 2);
                var cy = treeNode.y + (treeNode.dy / 2);
                var radius = 1;
                var circlePath = createCirclePath(cx, cy, radius);
                var origPath = this.getAttribute("d");

                this.setAttribute("_rectPath", rectPath);
                this.setAttribute("_origPath", origPath);
                this.setAttribute("_circlePath", circlePath);
            });
    }

    function centerOfRect(rect) {
        var cx = rect.x + (rect.dx / 2);
        var cy = rect.y + (rect.dy / 2);

        return {
            cx: cx,
            cy: cy
        }
    }

    function createPiciData(flatTree) {
        d3.selectAll(".picipath")
            .each(function() {
                var clazz = this.getAttribute("class");
                var nodeIndex = flatTree.indexes[clazz];
                var treeNode = flatTree.children[nodeIndex];
                var boundingRect = relativeBoundingRect(this, "#pici");
                var piciData = {
                    origPath: this.getAttribute("d"),
                    treeNode: treeNode,
                    rect: {
                        x: boundingRect.left,
                        y: boundingRect.top,
                        dx: boundingRect.width,
                        dy: boundingRect.height
                    }
                };
                this.__piciData__ = piciData;
            });
    }

    function transitionToCircles() {
        d3.selectAll(".picipath")
            .attr("d", function() {
                var rect = this.__piciData__.rect;
                var center = centerOfRect(rect);
                var radius = 1;
                var circlePath = createCirclePath(center.cx, center.cy, radius);
                return circlePath;
            });
    }

    function transitionToRects() {
        d3.selectAll(".picipath")
            .attr("d", function() {
                var rect = this.__piciData__.rect;
                var rectPath = createRectPath(rect.x, rect.y, rect.dx, rect.dy);
                return rectPath;
            });
    }

    function transitionToTreeMap() {
        d3.selectAll(".picipath")
            .attr("d", function() {
                var rect = this.__piciData__.treeNode;
                var rectPath = createRectPath(rect.x, rect.y, rect.dx, rect.dy);
                return rectPath;
            });
    }

    function transitionToOriginal() {
        d3.selectAll(".picipath")
            .transition()
            .delay(function() {
                var delay = mathUtil.randomIntBetween(0, 1000);
                return delay;
            })
            .duration(function() {
                var duration = mathUtil.randomIntBetween(100, 60000);
                return duration;
            })
            .attr("d", function() {
                var origPath = this.__piciData__.origPath;
                return origPath;
            });
    }

    function makeVisible() {
        document.querySelector("#pici").className = "visible";
    }

    d3.xml("rsrc/abendmahl.svg").mimeType("image/svg+xml").get(function(error, xml) {
        if (error) throw error;
        document.querySelector("#pici").appendChild(xml.documentElement);
        var areaMap = computeAreaMap();
        var flatTree = createFlatTreeFromAreaMap(areaMap);
        var treeMapData = createTreeMapDataFromFlatTree(flatTree);

        createPiciData(flatTree);

        $timeout(function() {
            transitionToRects();
            $timeout(makeVisible);
            $timeout(function() {
                makeVisible();
                transitionToOriginal();
            });
        }, 0);
    });

});