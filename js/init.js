var RADAR = {};

RADAR.width = window.innerWidth;
RADAR.height = window.innerHeight;
RADAR.svg = d3.select("body").append("svg")
    .attr("width", RADAR.width)
    .attr("height", RADAR.height);