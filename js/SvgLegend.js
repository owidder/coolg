'use strict';

/* global bottle */
/* global _ */

bottle.factory("SvgLegend", function (container) {

    function SvgLegend(svgSelector, legendSelector) {
        var svgCanvas, legendCanvas;

        function createEntryFunctionViaLegendAttribute(svgElement) {
            return svgElement.getAttribute("_legend");
        }

        var legendText;
        function setLegendText(text) {
            legendText = text;
        }

        function doLegend(x, y) {
            if(!_.isEmpty(legendText)) {
                updateLegend([legendText]);

                legendCanvas.select("g.legend")
                    .attr("transform", "translate(" + (x + 10) + "," + (y + 10) + ")");
            }
            else {
                hideLegend();
            }
        }

        function hideLegend() {
            var legend = legendCanvas.select("g.legend");
            legend.classed("on", false);
            legend.classed("off", true);
        }

        function showLegend() {
            var legend = legendCanvas.select("g.legend");
            legend.classed("off", false);
            legend.classed("on", true);
        }

        function appendLegend() {
            var legend = legendCanvas
                .append("g")
                .attr("class", "legend off");

            legend.append("rect")
                .attr("class", "legend")
                .attr("fill", "black")
                .attr("width", 100)
                .attr("height", 100)
                .attr("stroke", "white")
                .attr("opacity", 0.6);

            legend.append("text")
                .attr("class", "legend")
                .attr("fill", "white");
        }

        function updateLegend(entryStrList) {
            var maxLength = container.util.getLongestString(entryStrList);
            var gLegend = legendCanvas.select("g.legend");

            var legendRect = gLegend.select("rect.legend");
            legendRect.transition()
                .attr("height", (entryStrList.length + 2) + "em")
                .attr("width", (maxLength + 1) * (2) + "em");

            var legendText = gLegend.select("text.legend");
            var legendData = legendText.selectAll(".textline")
                .data(entryStrList);

            legendData.enter()
                .append("tspan")
                .attr("font-size", "2.0em")
                .attr("class", "textline")
                .attr("x", "0.3em")
                .attr("y", function (d, i) {
                    return (i + 1) * 20;
                });

            legendText.selectAll(".textline")
                .text(function (d) {
                    return d;
                });

            legendData.exit().remove();

            if (entryStrList.length == 0) {
                hideLegend();
            }
            else {
                showLegend();
            }
        }

        function init() {
            svgCanvas = d3.select(svgSelector);
            legendCanvas = d3.select(legendSelector);
            appendLegend();
        }

        this.setLegendText = setLegendText;
        this.doLegend = doLegend;
        this.hideLegend = hideLegend;
        this.init = init;

    }

    return SvgLegend;
});
