'use strict';

/* global d3 */
/* global _ */
/* global $ */
/* global Handlebars */

bottle.factory("Background", function (container) {
    var util = container.util;
    var SimplePromise = container.SimplePromise;
    var db = container.db;

    var Background = function (field) {
        var radius = (Math.min(field.width, field.height) / 2) - 30;

        var color = d3.scaleOrdinal(d3["schemeCategory20"]);

        var gRadar = field.gRadar;

        var DEMO_SEGMENTS = [
            {name: "Tools", id: "segment0"},
            {name: "Platforms", id: "segment1"},
            {name: "Languages", id: "segment2"},
            {name: "Methods", id: "segment3"},
            {name: "Techniques", id: "segment4"},
            {name: "Frameworks", id: "segment5"},
            {name: "Archtectures", id: "segment6"},
            {name: "Misc.", id: "segment7"}
        ];

        var DEMO_RINGS = [
            {name: "Why do you wait? Just Use it!", id: "ring0"},
            {name: "Use it slowly", id: "ring1"},
            {name: "Make a PoC", id: "ring2"},
            {name: "Read about it", id: "ring3"},
            {name: "Wait a little longer", id: "ring4"},
            {name: "Wait much longer", id: "ring5"},
            {name: "C'mon! That's BS", id: "ring6"},
            {name: "This will never fly!", id: "ring7"}
        ];


        var segments = DEMO_SEGMENTS;
        var rings = DEMO_RINGS;

        var ID_SEGMENTS = "segments";
        var ID_RINGS = "rings";

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

        function initRings() {
            rings = rings.map(function (ring, i) {
                return {
                    name: ring.name,
                    id: ring.id,
                    ringNo: i
                }
            })
        }

        function loadSegments() {
            db.load().then(function (radar) {
                if(radar != null && radar.segments != null) {
                    segments = radar.segments;
                    initSegments();
                    draw();
                    refreshSegmentForm();
                }
            });
        }

        function saveSegments() {
            db.save("segments", segments);
        }

        function loadRings() {
            db.load().then(function (radar) {
                if(radar != null && radar.rings != null) {
                    rings = radar.rings;
                    initRings();
                    draw();
                    refreshRingForm();
                }
            });
        }

        function load() {
            loadSegments();
            loadRings();
        }

        function saveRings() {
            db.save("rings", rings);
        }

        function changeSegmentName(id, newName) {
            segments.forEach(function (segment) {
                if(segment.id == id) {
                    segment.name = newName;
                }
            });
            draw();
            saveSegments();
        }

        function changeRingName(id, newName) {
            rings.forEach(function (ring) {
                if(ring.id == id) {
                    ring.name = newName;
                }
            });
            draw();
            saveRings();
        }

        function segmentFromId(id) {
            return segments.find(function (segment) {
                return segment.id == id;
            })
        }

        function ringFromId(id) {
            return rings.find(function (ring) {
                return ring.id == id;
            })
        }

        function removeSegment(id) {
            segments = segments.filter(function (segment) {
                return  segment.id != id;
            });
            initSegments();
            draw();
            refreshSegmentForm();
            saveSegments();
        }

        function removeRing(id) {
            rings = rings.filter(function (ring) {
                return  ring.id != id;
            });
            initRings();
            draw();
            refreshRingForm();
            saveRings();
        }

        function addSegmentAfterId(id) {
            var segment = segmentFromId(id);
            var index = segment.no;
            segments.splice(index+1, 0, {
                name: "",
                id: "segment" + util.uid()
            });

            initSegments();
            draw();
            refreshSegmentForm();
            saveSegments();
        }

        function addRingAfterId(id) {
            var ring = ringFromId(id);
            var index = ring.ringNo;
            rings.splice(index+1, 0, {
                name: "",
                id: "ring" + util.uid()
            });

            initRings();
            draw();
            refreshRingForm();
            saveRings();
        }

        function refreshSegmentForm() {
            $("#form-segments").empty();
            var inputSegmentsTemplateScript = $("#input-segments").html();
            var inputSegmentsTemplate = Handlebars.compile(inputSegmentsTemplateScript);
            var ctx = {
                segments: segments
            };
            var inputSegmentsHtml = inputSegmentsTemplate(ctx);
            $("#form-segments").append(inputSegmentsHtml);
        }

        function refreshRingForm() {
            $("#form-rings").empty();
            var inputRingsTemplateScript = $("#input-rings").html();
            var inputRingsTemplate = Handlebars.compile(inputRingsTemplateScript);
            var ctx = {
                rings: rings
            };
            var inputRingsHtml = inputRingsTemplate(ctx);
            $("#form-rings").append(inputRingsHtml);
        }

        function highlightOn(highlightId) {
            draw(highlightId);
        }

        function highlightOff() {
            draw(null);
        }

        function draw(highlightId) {
            var data = rings.map(function(ring, index) {
                var inner = index * (radius / rings.length);
                var outer = (index+1) * (radius / rings.length);
                return {
                    ring: ring,
                    arc: d3.arc().outerRadius(outer).innerRadius(inner),
                    segments: segments
                }
            });

            var gRingData = gRadar.selectAll("g.ring").data(data);
            gRingData.enter()
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

            var gArcEnter = gArcData.enter()
                .append("g")
                .attr("class", "arc");

            gArcEnter.append("path")
                .attr("class", "arc")
                .on("mouseout", function (d) {
                    if (field.svgLegend != null) {
                        field.svgLegend.setLegendText("");
                    }
                });

            var gArcAll = gRingAll.selectAll("g.arc");
            gArcAll.selectAll("path.arc").data(function (d) {
                return [d];
            });

            gArcAll.selectAll("path.arc")
                .attr("class", function (d) {
                    var ringId = this.parentNode.parentNode.__data__.ring.id;
                    return "arc arc-" + d.id + " arc-" + ringId;
                })
                .on("mouseover", function (d) {
                    if(field.svgLegend != null) {
                        var ring = this.parentNode.parentNode.__data__.ring;
                        field.svgLegend.setLegendText(ring.name);
                    }
                })
                .style("fill", function(d) {
                    return color(d.no);
                })
                .transition()
                .duration(1000)
                .attr("d", function (d) {
                    var arc = this.parentNode.parentNode.__data__.arc;
                    return arc(d.pie);
                })
                .style("opacity", function (d, i) {
                    var opacity, ringNo;
                    if(highlightId == null) {
                        ringNo = this.parentNode.parentNode.__data__.ring.ringNo;
                        opacity = (1 / (rings.length+1)) * (ringNo+1);
                    }
                    else if(d3.select(this).classed("arc-" + highlightId)) {
                        opacity = 1;
                    }
                    else {
                        opacity = 0.05;
                    }
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
        this.showSegments = refreshSegmentForm;
        this.showRings = refreshRingForm;
        this.changeSegmentName = changeSegmentName;
        this.changeRingName = changeRingName;
        this.removeSegment = removeSegment;
        this.removeRing = removeRing;
        this.addSegmentAfterId = addSegmentAfterId;
        this.addRingAfterId = addRingAfterId;
        this.load = load;
        this.highlightOn = highlightOn;
        this.highlightOff = highlightOff;

        initSegments();
        initRings();
        draw();
        refreshSegmentForm();
        refreshRingForm();
    };

    return Background;
});