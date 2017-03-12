'use strict';

/* global RADAR */

var ItemField = function () {

    var color = d3.scaleOrdinal(d3["schemeCategory20"]);

    var itemNames = [
        "Digitalization",
        "Microservices",
        "Docker Swarm",
        "Consul",
        "Cloud Computing",
        "Gamification",
        "Infrastructure as Code",
        "NoSQL",
        "Grafana",
        "Let's Encrypt",
        "Webpack",
        "React",
        "Angular 2",
        "D3",
        "Cloud IDE",
        "Clojure",
        "BYOD",
        "Ember",
        "Redux",
        "Spriong Boot",
        "Enzyme"
    ];

    var itemData = itemNames.map(function(name, i) {
        return {
            x: 20,
            y: (i+1)*25,
            name: name
        }
    });

    var svgLegend = new SvgLegend();

    function dragstarted(d) {
        d3.select(this).raise().classed("active", true);
    }

    function dragged(d) {
        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }

    function dragended(d) {
        d3.select(this).classed("active", false);
    }

    RADAR.gItems.selectAll("circle.item")
        .data(itemData)
        .enter()
        .append("circle")
        .attr("class", "item")
        .attr("r", 10)
        .attr("cx", function (d) {
            return  d.x;
        })
        .attr("cy", function (d) {
            return d.y;
        })
        .style("fill", function (d) {
            return color(d.name);
        })
        .on("mouseover", function (d) {
            if(RADAR.svgLegend != null) {
                RADAR.svgLegend.setLegendText(d.name);
            }
        })
        .on("mouseout", function (d) {
            if(RADAR.svgLegend != null) {
                RADAR.svgLegend.setLegendText("");
            }
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
};