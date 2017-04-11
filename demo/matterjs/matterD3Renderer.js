'use strict';

function MatterD3Renderer(_engine, _gStatic, _gDynamic) {
    var gStatic = _gStatic;
    var gDynamic = _gDynamic;
    var engine = _engine;

    var width = window.innerWidth;
    var height = window.innerHeight;

    function isStatic(body) {
        return body.isStatic;
    }

    function isNonFluid(body) {
        return !body.isFluid || body.isNonFluid;
    }

    function isCircle(body) {
        return body.label.startsWith("Circle");
    }

    function isNonFluidCircle(body) {
        return isNonFluid(body) && isCircle(body);
    }

    function isNonFluidNonCircle(body) {
        return isNonFluid(body) && !isCircle(body);
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
        if(d != null && d.className != null) {
            return d.className + " " + defaultClassName;
        }
        else {
            return defaultClassName;
        }
    }

    function smoothPathFromBodies(bodies) {
        var visibleBodies = bodies.filter(function (body) {
            return body.position.y < width + 300;
        });

        var coords = visibleBodies.map(function (body) {
            return [body.position.x, body.position.y];
        });

        var convexHull = d3.polygonHull(coords);

        var path;
        if(convexHull != null) {
            path = d3.line().curve(d3.curveBasisClosed)(convexHull);
        }
        else {
/*
            console.log("no hull: " + visibleBodies[0].className);
            path = d3.line().curve(d3.curveBasisClosed)(coords);
*/
        }

         return path;
    }

    function renderD3FluidWithGroup(group) {
        var fluidBodies = Matter.Composite.allBodies(engine.world).filter(function (body) {
            return isFluidWithGroup(body, group);
        });

        if(fluidBodies != null && fluidBodies.length > 0) {
            var data = gDynamic.selectAll("path.fluidbody." + group)
                .data([fluidBodies]);

            data.enter()
                .append("path")
                .attr("class", function (d) {
                    return createClassNameFromBody(d[0], "fluidbody " + group);
                });

            gDynamic.selectAll("path.fluidbody." + group)
                .attr("d", smoothPathFromBodies);
        }
        else {
            gDynamic.selectAll("path.fluidbody." + group).remove();
        }
    }

    function renderD3Fluid() {
        engine._custom.groups.forEach(function (group) {
            renderD3FluidWithGroup(group);
        });
    }

    function renderD3NonFluidCircles() {
        var dynamicCircles = Matter.Composite.allBodies(engine.world).filter(isNonFluidCircle);

        var data = gDynamic.selectAll("circle.nonfluid")
            .data(dynamicCircles, function (d) {
                return d.id;
            });

        data.enter()
            .append("circle")
            .attr("class", function (d) {
                return createClassNameFromBody(d, "nonfluid");
            })
            .attr("r", function (d) {
                return d.circleRadius;
            });

        gDynamic.selectAll("circle.nonfluid")
            .attr("cx", function (d) {
                return d.position.x
            })
            .attr("cy", function (d) {
                return d.position.y
            });

        data.exit().remove();
    }

    function renderD3NonFluidNonCircles() {
        var dynamicNonCircles = Matter.Composite.allBodies(engine.world).filter(isNonFluidNonCircle);

        var data = gDynamic.selectAll("path.nonfluid")
            .data(dynamicNonCircles, function(d) {
                return d.id;
            });

        data.enter()
            .append("path")
            .attr("class", function (d) {
                return createClassNameFromBody(d, "nonfluid");
            });

        gDynamic.selectAll("path.nonfluid")
            .attr("d", createPathFromBody);

        data.exit().remove();
    }

    function renderD3() {
        renderD3NonFluidCircles();
        renderD3NonFluidNonCircles();
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
        renderD3();
        renderD3DynamicTitles();
        renderCounter++;
    };

    function gc() {
        function isDynamic(body) {
            return !body.isStatic;
        }
        var dynamicBodies = Matter.Composite.allBodies(engine.world).filter(isDynamic);
        dynamicBodies.forEach(function(body) {
            if(body.position.y > height + 100) {
                Matter.World.remove(engine.world, body);
            }
            if(body.birth != null) {
                var lifetime = (new Date()).getTime() - body.birth;
                if(lifetime > body.ttl) {
                    Matter.World.remove(engine.world, body);
                }
            }
        })
    }

    setInterval(gc, 1000);
}
