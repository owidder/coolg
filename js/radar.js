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

    var DEMO_SEGMENTS = [
        {name: "Tools", id: 0},
        {name: "Platforms", id: 1},
        {name: "Languages", id: 2},
        {name: "Methods", id: 3},
        {name: "Techniques", id: 4},
        {name: "Frameworks", id: 5},
        {name: "Archtectures", id: 6},
        {name: "Misc.", id: 7}
    ];

    var segments = DEMO_SEGMENTS;

    var ID_SEGMENTS = "segments";

    function initSegments() {
        var pies = d3.pie()(_.fill(_.range(segments.length), 1));
        segments = segments.map(function (segment, i) {
            return {
                name: segment.name,
                id: segment.id,
                no: i,
                pie: pies[i]
            };
        });
    }

    function loadSegments() {
        if(RADAR.db != null) {
            RADAR.db.get(ID_SEGMENTS, function (doc) {
                if(doc != null && doc.segments != null) {
                    segments = doc.segments;
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

    function segmentFromId(id) {
        return segments.find(function (segment) {
            return segment.id == id;
        })
    }

    function removeSegment(id) {
        segments = segments.filter(function (segment) {
            return  segment.id != id;
        });
        initSegments();
        draw();
        showSegments();
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
        $("#form-segments").empty();
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

        var gRingAll = gRadar.selectAll("g.ring");

        var gArcData = gRingAll.selectAll("g.arc")
            .data(function (d) {
                return d.segments;
            }, function (d) {
                return d.id;
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

        var gArcAll = gRingAll.selectAll("g.arc");
        gArcAll.selectAll("path.arc").data(function (d) {
            return [d];
        });

        gArcAll.selectAll("path.arc")
            .on("mouseover", function (d) {
                if(RADAR.svgLegend) {
                    var ringNo = this.parentNode.parentNode.__data__.ringNo;
                    RADAR.svgLegend.setLegendText(ringName(ringNo));
                }
            })
            .transition()
            .duration(1000)
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
            });

        gArcData.exit().remove();

        var gLegendArcData = gRingAll.selectAll("g.legendarc")
            .data(function (d) {
                return d.segments;
            }, function (d) {
                return d.id;
            });

        var gLegendArcEnter = gLegendArcData.enter()
            .append("g")
            .attr("class", "legendarc");

        gLegendArcEnter.append("path")
            .attr("class", "legendarc")
            .style("fill", "none")
            .style("opacity", "0");

        var gLegendArcAll = gRingAll.selectAll("g.legendarc");
        gLegendArcAll.selectAll("path.legendarc").data(function (d) {
            return [d];
        });
        gLegendArcAll.selectAll("text").data(function (d) {
            return [d];
        });
        gLegendArcAll.selectAll("text").selectAll("textPath.legend").data(function (d) {
            return [d];
        });

        gLegendArcAll.selectAll("path.legendarc")
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
    this.removeSegment = removeSegment;

    initSegments();
    draw();
};