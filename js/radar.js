'use strict';

/* global RADAR */
/* global d3 */
/* global _ */
/* global $ */
/* global Handlebars */

var Radar = function (numberOfRings, numberOfSegments) {
    var radius = (Math.min(RADAR.width, RADAR.height) / 2) - 30;

    var color = d3.scaleOrdinal(d3["schemeCategory20"]);

    var gRadar = RADAR.gRadar;

    var DEMO_SEGMENT_NAMES = [
        "Tools",
        "Platforms",
        "Languages",
        "Methods",
        "Techniques",
        "Frameworks",
        "Architectures",
        "Misc."
    ];

    var segmentNames;

    var ID_SEGMENT_NAMES = "segmentNames";

    function loadSegmentNames() {
        segmentNames = DEMO_SEGMENT_NAMES;
        if(RADAR.db != null) {
            RADAR.db.get(ID_SEGMENT_NAMES, function (doc) {
                if(doc != null) {
                    segmentNames = doc.segmentNames;
                }
            })
        }
    }

    function segmentName(index) {
        if(segmentNames == null) {
            loadSegmentNames();
        }

        if(index < segmentNames.length) {
            return segmentNames[index];
        }
        else {
            return "Segment " + index;
        }
    }

    function ringName(index) {
        var ringNames = [
            "Why do you wait? Just Use it!",
            "Use it slowly",
            "Make a PoC",
            "Read about it",
            "Wait a little longer",
            "Wait much longer",
            "C'mon! That's BS",
            "This will never fly!"
        ];

        if(index < ringNames.length) {
            return ringNames[index];
        }
        else {
            return "Ring " + index;
        }
    }

    function showSegments() {
        var inputSegmentsTemplateScript = $("#input-segments").html();
        var inputSegmentsTemplate = Handlebars.compile(inputSegmentsTemplateScript);
        var context = {
            segments: segmentNames.map(function (name) {
                return {
                    name: name
                };
            })
        }
        var inputSegmentsHtml = inputSegmentsTemplate(context);
        $("#form-segments").append(inputSegmentsHtml);
    }

    function draw() {
        var data = _.range(numberOfRings).map(function(index) {
            var inner = index * (radius / numberOfRings);
            var outer = (index+1) * (radius / numberOfRings);
            return {
                ringNo: index,
                arc: d3.arc().outerRadius(outer).innerRadius(inner),
                pie: d3.pie()(_.fill(_.range(numberOfSegments), 1))
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
            })
            .on("mouseover", function (d) {
                if(RADAR.svgLegend) {
                    var ringNo = this.parentNode.parentNode.__data__.ringNo;
                    RADAR.svgLegend.setLegendText(ringName(ringNo));
                }
            })
            .on("mouseout", function (d) {
                if(RADAR.svgLegend) {
                    RADAR.svgLegend.setLegendText("");
                }
            });

        var gLegendArc = gRing.selectAll("g.legendarc")
            .data(function (d) {
                return d.pie;
            })
            .enter()
            .append("g")
            .attr("class", "legendarc");

        gLegendArc.append("path")
            .attr("d", function (d) {
                var arc = d3.arc().outerRadius(radius + 10).innerRadius(radius + 10);
                return arc(d)
            })
            .attr("id", function (d, i) {
                return "legendarc" + i;
            })
            .style("fill", "none")
            .style("opacity", "0");

        gLegendArc.append("text")
            .append("textPath")
            .attr("xlink:href", function(d, i) {
                return "#legendarc" + i;
            })
            .style("text-anchor","middle") //place the text halfway on the arc
            .attr("startOffset", "20%")
            .text(function(d, i) {
                return segmentName(i);
            });
    }

    this.draw = draw;
    this.showSegments = showSegments;

    draw();
};