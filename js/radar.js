'use strict';

/* global RADAR */
/* global d3 */
/* global _ */

var Radar = function (numberOfRings, numberOfSections) {
    var radius = (Math.min(RADAR.width, RADAR.height) / 2) - 30;

    var color = d3.scaleOrdinal(d3["schemeCategory20"]);

    var gRadar = RADAR.svg.append("g")
        .attr("transform", "translate(" + RADAR.width / 2 + "," + RADAR.height / 2 + ")");

    function draw() {
        var data = _.range(numberOfRings).map(function(index) {
            var inner = index * (radius / numberOfRings);
            var outer = (index+1) * (radius / numberOfRings);
            return {
                ringNo: index,
                arc: d3.arc().outerRadius(outer).innerRadius(inner),
                pie: d3.pie()(_.fill(_.range(numberOfSections), 1))
            }
        });

        var gRingData = gRadar.selectAll("g.ring").data(data);
        var gRingEnter = gRingData.enter();

        var gRing = gRingEnter.append("g")
            .attr("class", "ring");

        var gArc = gRing.selectAll("g.arc")
            .data(function (d) {
                return d.pie;
            })
            .enter()
            .append("g")
            .attr("class", "arc");

        gArc.append("path")
            .attr("d", function (d) {
                var arc = this.parentNode.parentNode.__data__.arc;
                return arc(d);
            })
            .style("fill", function(d, i) {
                return color(i);
            })
            .style("opacity", function (d) {
                var ringNo = this.parentNode.parentNode.__data__.ringNo;
                var opacity = (1 / (numberOfRings+1)) * (ringNo+1);
                return opacity;
            });
    }

    this.draw = draw;

    draw();
};