'use strict';

function moveTo(simulation, id, targetX, targetY, maxSteps, velocity, maxDuration) {
    var startMillis = (new Date()).getTime();

    function hypot(dx, dy) {
        return Math.sqrt(dx*dx + dy*dy);
    }

    function moveOne(d, stepX, stepY, stepDuration) {
        var prom = new SimplePromise();

        setTimeout(function() {
            simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;

            setTimeout(function() {
                d.fx += stepX;
                d.fy += stepY;

                setTimeout(function() {
                    simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                    prom.resolve();
                }, stepDuration);
            });
        });

        return prom.promise;
    }

    function moveRecursive(d, stepCtr) {
        function computeStepLength(target, current) {
            var length;
            if(Math.abs(target - current) < 10) {
                length = target - current;
            }
            else {
                length = (target - current) / 50;
            }

            return length;
        }

        function distanceToTarget() {
            return hypot(targetX - d.x, targetY - d.y);
        }

        var stepX = computeStepLength(targetX, d.x);
        var stepY = computeStepLength(targetY, d.y);
        var stepLength = hypot(stepX, stepY);
        var stepDuration = 1 / (velocity / stepLength);
        console.log(stepDuration);

        moveOne(d, stepX, stepY, stepDuration).then(function() {
            var millisSince = (new Date()).getTime() - startMillis;
            if(distanceToTarget() > stepLength && millisSince < maxDuration && stepCtr < maxSteps) {
                moveRecursive(d, stepCtr+1);
            }
            else {
                moveProm.resolve();
            }
        });
    }

    var moveProm = new SimplePromise();
    var data = d3.select(id).data()[0];
    moveRecursive(data, 0);

    return moveProm.promise;
}

function circlePoint(cx, cy, r, angle) {
    var x = cx + r * Math.cos(2 * Math.PI * angle / 360);
    var y = cy + r * Math.sin(2 * Math.PI * angle / 360);
    return {
        x: x,
        y: y
    };
}

function moveOnCircleRecursive(simulation, id, cx, cy, r, currentAngle, step, stopEvent) {
    var stop = false;
    stopEvent.on(function() {
        stop = true;
    });
    var pt = circlePoint(cx, cy, r, currentAngle);
    moveTo(simulation, id, pt.x, pt.y, 5, 1, 1000).then(function() {
        if(!stop) {
            moveOnCircleRecursive(simulation, id, cx, cy, r, currentAngle+step, step);
        }
    });
}

function moveOnCircle(simulation, id, cx, cy, r, startAngle, step) {
    var stopEvent = new SimpleEvent();
    moveOnCircleRecursive(simulation, id, cx, cy, r, startAngle, step);

    return stopEvent;
}