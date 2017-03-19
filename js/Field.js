'use strict';

/* global bottle */

bottle.factory("Field", function (container) {
    var SvgLegend = container.SvgLegend;

    var Field = function(svgSelector) {
        if(svgSelector == null) {
            svgSelector = "div.svg";
        }

        this.svgClasses = "svg canvas";
        this.gLegendClasses = "legend canvas";
        this.gItemsClasses = "items";

        this.width = window.innerWidth;
        this.height = window.innerHeight * (4/5);
        this.svg = d3.select(svgSelector).append("svg")
            .attr("class", this.svgClasses)
            .attr("width", this.width)
            .attr("height", this.height)
            .on("mousemove", function () {
                if(this.svgLegend != null) {
                    var position = d3.mouse(this);
                    this.svgLegend.doLegend(position[0], position[1]);
                }
            });

        this.gRadar = this.svg.append("g")
            .attr("transform", "translate(" + this.width / 5 * 2 + "," + this.height / 2 + ")");
        this.gItems = this.svg.append("g").attr("class", this.gItemsClasses);
        this.gLegend = this.svg.append("g").attr("class", this.gLegendClasses);

        this.svgLegend = new SvgLegend();
        this.svgLegend.init();
    };

    return Field;
});
