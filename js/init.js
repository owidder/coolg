'use strict';

/* global RADAR */

RADAR.width = window.innerWidth;
RADAR.height = window.innerHeight;
RADAR.svg = d3.select("body").append("svg")
    .attr("class", "svg canvas")
    .attr("width", RADAR.width)
    .attr("height", RADAR.height)
    .on("mousemove", function () {
        if(RADAR.svgLegend != null) {
            var position = d3.mouse(this);
            RADAR.svgLegend.doLegend(position[0], position[1]);
        }
    });
RADAR.gRadar = RADAR.svg.append("g")
    .attr("transform", "translate(" + RADAR.width / 2 + "," + RADAR.height / 2 + ")");
RADAR.gLegend = RADAR.svg.append("g").attr("class", "legend canvas");

RADAR.svgLegend = new SvgLegend();
RADAR.svgLegend.init();