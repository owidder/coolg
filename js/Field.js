'use strict';

/* global PouchDB */

bottle.factory("Field", function (container) {
    SvgLegend = container.SvgLegend;

    var Field = function(svgSelector, svgClasses, gLegendClasses) {
        if(svgSelector == null) {
            svgSelector = "div.svg";
        }

        if(svgClasses == null) {
            svgClasses = "svg canvas";
        }

        if(gLegendClasses == null) {
            gLegendClasses = "legend canvas";
        }

        this.width = window.innerWidth;
        this.height = window.innerHeight * (4/5);
        this.svg = d3.select(svgSelector).append("svg")
            .attr("class", svgClasses)
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
        this.gItems = this.svg.append("g").attr("class", "items");
        this.gLegend = this.svg.append("g").attr("class", gLegendClasses);

        this.svgLegend = new SvgLegend();
        this.svgLegend.init();

        this.db = new PouchDB('radar');
    };

    return Field;
});

