'use strict';

function MatterD3Renderer(_engine, _gStatic, _gDynamic) {
    var gStatic = _gStatic;
    var gDynamic = _gDynamic;
    var engine = _engine;

    function isStatic(body) {
        return body.isStatic;
    }

    function isDynamic(body) {
        return !body.isStatic && !body.isFluid;
    }

    function isCircle(body) {
        return body.label.startsWith("Circle");
    }

    function isDynamicCircle(body) {
        return isDynamic(body) && isCircle(body);
    }

    function isDynamicNonCircle(body) {
        return isDynamic(body) && !isCircle(body);
    }

    function hasTitle(body) {
        return body.title != null;
    }

    function isFluid(body) {
        return body.isFluid;
    }

    function isFluidWithGroup(body, group) {
        return isFluid(body) && body.group == group;
    }

    function createPathFromBody(d) {
        var pathStr = "";
        if(d.vertices.length > 0) {
            pathStr += "M" + d.vertices[0].x + " " + d.vertices[0].y;
            if(d.vertices.length > 1) {
                var i;
                for(i = 1; i < d.vertices.length; i++) {
                    pathStr += " L" + d.vertices[i].x + " " + d.vertices[i].y;
                }
            }
        }
        pathStr += " Z";

        return pathStr;
    }

    function createClassNameFromBody(d, defaultClassName) {
        if(d.className != null) {
            return d.className + " " + defaultClassName;
        }
        else {
            return defaultClassName;
        }
    }

    function createClassNameFromBodyForStatic(d) {
        return createClassNameFromBody(d, "static");
    }

    function createClassNameFromBodyForDynamic(d) {
        return createClassNameFromBody(d, "dynamic");
    }

    function renderD3Static() {
        var staticBodies = Matter.Composite.allBodies(engine.world).filter(isStatic);

        var data = gStatic.selectAll("path.static")
            .data(staticBodies);

        data.enter()
            .append("path")
            .attr("class", createClassNameFromBodyForStatic)
            .attr("d", createPathFromBody);

        data.exit().remove();
    }

    function smoothPathFromBodies(bodies) {
        var coords = bodies.map(function (body) {
            return [body.position.x, body.position.y];
        });

        var path = d3.svg.line().interpolate('basis-closed')(coords);

        return path;
    }

    function renderD3FluidWithGroup(group) {
        var fluidBodies = Matter.Composite.allBodies(engine.world).filter(function (body) {
            return isFluidWithGroup(body, group);
        });

        var data = gDynamic.selectAll("path.dynamic." + group)
            .data([fluidBodies]);

        data.enter()
            .append("path")
            .attr("class", createClassNameFromBodyForDynamic);

        gDynamic.selectAll("path.dynamic." + group)
            .attr("d", smoothPathFromBodies);
    }

    function renderD3Fluid() {
        renderD3FluidWithGroup("red");
    }

    function renderD3DynamicCircles() {
        var dynamicCircles = Matter.Composite.allBodies(engine.world).filter(isDynamicCircle);

        var data = gDynamic.selectAll("circle.dynamic")
            .data(dynamicCircles, function (d) {
                return d.id;
            });

        data.enter()
            .append("circle")
            .attr("class", createClassNameFromBodyForDynamic)
            .attr("r", function (d) {
                return d.circleRadius;
            });

        gDynamic.selectAll("circle.dynamic")
            .attr("cx", function (d) {
                return d.position.x
            })
            .attr("cy", function (d) {
                return d.position.y
            });
    }

    function renderD3DynamicNonCircles() {
        var dynamicNonCircles = Matter.Composite.allBodies(engine.world).filter(isDynamicNonCircle);

        var data = gDynamic.selectAll("path.dynamic")
            .data(dynamicNonCircles, function(d) {
                return d.id;
            });

        data.enter()
            .append("path")
            .attr("class", createClassNameFromBodyForDynamic);

        gDynamic.selectAll("path.dynamic")
            .attr("d", createPathFromBody);

        data.exit().remove();
    }

    function renderD3Dynamic() {
        renderD3DynamicCircles();
        renderD3DynamicNonCircles();
        renderD3Fluid();
    }

    function renderD3DynamicTitles() {
        var bodiesWithTitles = Matter.Composite.allBodies(engine.world).filter(hasTitle);

        if(bodiesWithTitles.length > 0) {
            var data = gDynamic.selectAll("text.dynamic")
                .data(bodiesWithTitles, function(d) {
                    return d.id;
                });

            data.enter()
                .append("text")
                .attr("class", "dynamic")
                .text(function(d) {
                    return d.title;
                });

            gDynamic.selectAll("text.dynamic")
                .attr("x", function(d) {
                    var avx = (d.bounds.max.x + d.bounds.min.x) / 2 - 20;
                    return avx;
                })
                .attr("y", function(d) {
                    var avy = (d.bounds.max.y + d.bounds.min.y) / 2 - 15;
                    return avy;
                });
        }

    }

    var renderCounter = 0;

    this.constructor.prototype.renderD3 = function() {
        if(gStatic != null) {
            renderD3Static();
        }
        if(gDynamic != null) {
            renderD3Dynamic();
            renderD3DynamicTitles();
            renderCounter++;
        }
    }
}
