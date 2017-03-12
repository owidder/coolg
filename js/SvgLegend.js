'use strict';

/* global UTIL */
/* global _ */

function SvgLegend(_createEntryFunction, _findSvgElementsForLegendFunction, _legendDetectorRadius, _svgSelector, _forLegendSelector, _legendSelector, _util) {
    var that = this;
    var util = _util || UTIL;
    var svgSelector = _svgSelector || ".svg.canvas";
    var legendSelector = _legendSelector || ".legend.canvas";
    var forLegendSelector = _forLegendSelector || ".forlegend";
    var createEntry = _createEntryFunction || createEntryFunctionViaLegendAttribute;
    var findSvgElementForLegend = _findSvgElementsForLegendFunction || findSvgElementsForLegendViaBoundingRects;
    var legendDetectorRadius = _legendDetectorRadius || 0;

    var svgCanvas, legendCanvas;

    function createEntryFunctionViaLegendAttribute(svgElement) {
        return svgElement.getAttribute("_legend");
    }

    function getSvgBoundingRectOfElement(selector) {
        var boundingRect = {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        };
        var element = document.querySelector(selector);
        if (element != null) {
            util.copyAttributes(["top", "left", "right", "bottom"], element.getBoundingClientRect(), boundingRect);
        }

        return boundingRect;
    }

    function adaptPositionToElement(x, y, selector) {
        var svgBoundingRect = getSvgBoundingRectOfElement(selector);
        var xAdapted = x + svgBoundingRect.left;
        var yAdapted = y + svgBoundingRect.top;

        return {
            x: xAdapted,
            y: yAdapted
        }
    }

    function adaptPositionToSvg(x, y) {
        return adaptPositionToElement(x, y, svgSelector)
    }

    function findSvgElementsForLegendViaBoundingRects(x, y) {
        var adapted = adaptPositionToSvg(x, y);
        var forlegends = document.querySelectorAll(forLegendSelector);
        var i, forlegend, boundingRect;
        var nearbyEntryForlegends = [];
        for (i = 0; i < forlegends.length; i++) {
            forlegend = forlegends[i];
            boundingRect = forlegend.getBoundingClientRect();
            if (adapted.x > boundingRect.left - legendDetectorRadius && adapted.x < boundingRect.right + legendDetectorRadius &&
                adapted.y > boundingRect.top - legendDetectorRadius && adapted.y < boundingRect.bottom + legendDetectorRadius) {
                nearbyEntryForlegends.push(forlegend);
            }
        }

        return nearbyEntryForlegends;
    }

    function createLegendEntryList(elementList) {
        var entryList = [];
        var entryStr;
        var i, svgElement;
        for (i = 0; i < elementList.length; i++) {
            svgElement = elementList[i];
            var entryStr = createEntry(svgElement);
            entryList.push(entryStr)
        }

        entryList.sort();
        return entryList;
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

    function switchLegend() {
        if (isLegendShown()) {
            hideLegend();
        }
        else {
            showLegend();
        }
    }

    function isLegendShown() {
        return legendCanvas.select("g.legend.on").size() > 0;
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
        var maxLength = util.getLongestString(entryStrList);
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

    that.setLegendText = setLegendText;
    that.doLegend = doLegend;
    that.switchLegend = switchLegend;
    that.hideLegend = hideLegend;
    that.init = init;

}
