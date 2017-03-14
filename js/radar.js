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

    var segmentNames = DEMO_SEGMENT_NAMES;
    var segments = [];

    var ID_SEGMENT_NAMES = "segmentNames";

    function initSegments() {
        var pies = d3.pie()(_.fill(_.range(segmentNames.length), 1));
        segments = segmentNames.map(function (name, i) {
            return {
                id: "segment" + i,
                name: name,
                no: i,
                pie: pies[i]
            };
        });
    }

    function loadSegments() {
        if(RADAR.db != null) {
            RADAR.db.get(ID_SEGMENT_NAMES, function (doc) {
                if(doc != null && doc.segmentNames != null) {
                    segmentNames = doc.segmentNames;
                    initSegments();
                    draw();
                }
            })
        }
    }

    function changeSegmentName(id, newName) {
        segments.forEach(function (segment) {
            if(segment.id == id) {
                segment.name = newName;
            }
        });
        draw();
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
            segments: segments
        };
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
                segments: segments
            }
        });

        var gRingData = gRadar.selectAll("g.ring").data(data);
        var gRingEnter = gRingData.enter()
            .append("g")
            .attr("class", "ring");

        gRingData.exit().remove();

        var gArcData = gRingEnter.selectAll("g.arc")
            .data(function (d) {
                return d.segments;
            });

        var gArcEnter = gArcData.enter().append("g")
            .attr("class", "arc");

        gArcEnter.append("path")
            .attr("class", "arc")
            .on("mouseout", function (d) {
                if (RADAR.svgLegend) {
                    RADAR.svgLegend.setLegendText("");
                }
            });

        gRadar.selectAll("path.arc")
            .attr("d", function (d) {
                var arc = this.parentNode.parentNode.__data__.arc;
                return arc(d.pie);
            })
            .style("fill", function(d) {
                return color(d.no);
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
            });

        gArcData.exit().remove();

        var gLegendArcData = gRingEnter.selectAll("g.legendarc")
            .data(function (d) {
                return d.segments;
            });

        var gLegendArcEnter = gLegendArcData.enter()
            .append("g")
            .attr("class", "legendarc");

        gLegendArcEnter.append("path")
            .attr("class", "legendarc")
            .style("fill", "none")
            .style("opacity", "0");

        gRadar.selectAll("path.legendarc")
            .attr("d", function (d) {
                var arc = d3.arc().outerRadius(radius + 10).innerRadius(radius + 10);
                return arc(d.pie)
            })
            .attr("id", function (d) {
                return "legendarc" + d.no;
            });

        gLegendArcEnter.append("text")
            .append("textPath")
            .attr("class", "legend")
            .style("text-anchor","middle") //place the text halfway on the arc
            .attr("startOffset", "20%");

        gRadar.selectAll("textPath.legend")
            .attr("xlink:href", function(d) {
                return "#legendarc" + d.no;
            })
            .text(function(d) {
                return d.name;
            });

        gLegendArcData.exit().remove();
    }

    this.draw = draw;
    this.showSegments = showSegments;
    this.changeSegmentName = changeSegmentName;

    initSegments();
    draw();
};