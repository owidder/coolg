'use strict';

/* global bottle */

bottle.factory("Field", function (container) {
    var SvgLegend = container.SvgLegend;

    var Field = function(svgSelector) {
        var that = this;

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
                if(that.svgLegend != null) {
                    var position = d3.mouse(this);
                    that.svgLegend.doLegend(position[0], position[1]);
                }
            });

        this.defs = this.svg.append("defs");
        var dropShadowFilter = this.defs.append('svg:filter')
            .attr('id', 'dropShadow')
            .attr('filterUnits', "userSpaceOnUse")
            .attr('width', '250%')
            .attr('height', '250%');
        dropShadowFilter.append('svg:feGaussianBlur')
            .attr('in', 'SourceGraphic')
            .attr('stdDeviation', 2)
            .attr('result', 'blur-out');
        dropShadowFilter.append('svg:feColorMatrix')
            .attr('in', 'blur-out')
            .attr('type', 'hueRotate')
            .attr('values', 180)
            .attr('result', 'color-out');
        dropShadowFilter.append('svg:feOffset')
            .attr('in', 'color-out')
            .attr('dx', 3)
            .attr('dy', 3)
            .attr('result', 'the-shadow');
        dropShadowFilter.append('svg:feBlend')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'the-shadow')
            .attr('mode', 'normal');

        this.gRadar = this.svg.append("g")
            .attr("transform", "translate(" + this.width / 5 * 2 + "," + this.height / 2 + ")");
        this.gItems = this.svg.append("g").attr("class", this.gItemsClasses);
        this.gLegend = this.svg.append("g").attr("class", this.gLegendClasses);

        this.svgLegend = new SvgLegend(".svg.canvas", ".legend.canvas");
        this.svgLegend.init();
    };

    return Field;
});
