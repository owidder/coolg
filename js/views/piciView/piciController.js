'use strict';

com_geekAndPoke_coolg.PICI_CONTROLLER = "piciController";

angular.module(com_geekAndPoke_coolg.moduleName).controller(com_geekAndPoke_coolg.PICI_CONTROLLER, function($timeout, $routeParams) {
    var dimensions  = bottle.container.dimensions;
    var funcs  = bottle.container.funcs;
    var mathUtil = bottle.container.mathUtil;

    var width, height;

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

    function gWrap() {
        d3.selectAll("svg > path")
            .each(function() {
                var g = document.createElement("svg:g");
                var newElement = this.parentNode.insertBefore(g, this);
                var clonedPath = this.cloneNode();
                newElement.appendChild(clonedPath);
            });
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
                    origTransform: this.getAttribute("transform"),
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
            .transition()
            .duration(2000)
            .attr("d", function() {
                var rect = this.__piciData__.rect;
                var rectPath = createRectPath(rect.x, rect.y, rect.dx, rect.dy);
                return rectPath;
            });
    }

    function shake(width, height) {
        d3.selectAll(".picipath")
            .transition()
            .duration(2000)
            .attr("transform", function() {
                var translateX = mathUtil.randomIntBetween(-width/2, width/2);
                var translateY = mathUtil.randomIntBetween(-height/2, height/2);
                var rotate = mathUtil.randomIntBetween(0, 360);
                return "translate(" + translateX + "," + translateY + ") rotate(" + rotate + ")";
            });
    }

    function unshake() {
        d3.selectAll(".picipath")
            .transition()
            .duration(2000)
            .attr("transform", function() {
                return this.__piciData__.origTransform;
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
            .attr("d", function() {
                var origPath = this.__piciData__.origPath;
                return origPath;
            });
    }

    function getStepFromId(stepId) {
        var steps = [
            shakeStep,
            transitionToRectStep,
            transitionToOriginalStep,
            unshakeStep,
            stop
        ];

        return steps[stepId];
    }

    function stop() {
        // do nothing
    }

    function startCascade() {
        d3.selectAll(".picipath")
            .each(function() {
                var firstStep = getStepFromId(0);
                firstStep(this, 1);
            });
    }

    function shakeStep(element, nextStepId) {
        d3.select(element)
            .transition()
            .duration(2000)
            .attr("transform", function() {
                var translateX = mathUtil.randomIntBetween(-width/2, width/2);
                var translateY = mathUtil.randomIntBetween(-height/2, height/2);
                var rotate = mathUtil.randomIntBetween(0, 360);
                return "translate(" + translateX + "," + translateY + ") rotate(" + rotate + ")";
            })
            .each("end", function() {
                var nextStep = getStepFromId(nextStepId);
                nextStep(this, nextStepId + 1);
            });
    }

    function unshakeStep(element, nextStepId) {
        d3.select(element)
            .transition()
            .delay(function() {
                var delay = mathUtil.randomIntBetween(0, 10000);
                return delay;
            })
            .duration(function() {
                var duration = mathUtil.randomIntBetween(1000, 60000);
                return duration;
            })
            .attr("transform", function() {
                return this.__piciData__.origTransform;
            })
            .each("end", function() {
                var nextStep = getStepFromId(nextStepId);
                nextStep(this, nextStepId + 1);
            });
    }

    function transitionToOriginalStep(element, nextStepId) {
        $timeout(function() {
            d3.select(element)
                .attr("d", function() {
                    var origPath = this.__piciData__.origPath;
                    return origPath;
                })
                .each(function() {
                    var nextStep = getStepFromId(nextStepId);
                    nextStep(this, nextStepId + 1);
                });
        }, mathUtil.randomIntBetween(0, 10000));
    }

    function transitionToRectStep(element, nextStepId) {
        d3.select(element)
            .transition()
            .duration(1000)
            .attr("d", function() {
                var rect = this.__piciData__.rect;
                var rectPath = createRectPath(rect.x, rect.y, rect.dx, rect.dy);
                return rectPath;
            })
            .each("end", function() {
                var nextStep = getStepFromId(nextStepId);
                nextStep(this, nextStepId + 1);
            });
    }

    function makeVisible() {
        d3.selectAll("#pici")
            .attr("class", "visible");
    }

    var picId = $routeParams.p;
    if(funcs.isEmpty(picId)) {
        picId = '1';
    }
    var picData = {
        '1': {
            filename: 'guernica3',
            artist: 'Picasso'
        },
        '2': {
            filename: 'mona_1',
            artits: 'Leonardo da Vinci'
        },
        '3': {
            filename: 'abendmahl',
            artist: 'Rembrandt'
        },
        '4': {
            filename: 'schrei',
            artist: 'Munch'
        },
        '5': {
            filename: 'Starry-Night-Over-the-Rhone-2',
            artist: 'Van Gogh'
        }
    };

    d3.xml("rsrc/" + picData[picId].filename + ".svg").mimeType("image/svg+xml").get(function(error, xml) {
        if (error) throw error;

        document.querySelector("#pici").appendChild(xml.documentElement);
        var areaMap = computeAreaMap();
        var flatTree = createFlatTreeFromAreaMap(areaMap);
        var piciElement = document.querySelector("#pici");
        var piciElementRect = piciElement.getBoundingClientRect();
        width = piciElementRect.width;
        height = piciElementRect.height;
        var treeMapData = createTreeMapDataFromFlatTree(flatTree);

        createPiciData(flatTree);
        transitionToTreeMap();
        makeVisible();
        $timeout(makeVisible);

        $timeout(function() {
            startCascade();
        }, 2000);
    });

});