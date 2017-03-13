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
            x: i < 11 ? 20 : 160,
            y: i < 11 ? i*40 + 5 : (i-10) * 40 + 5,
            name: name
        }
    });

    var svgLegend = new SvgLegend();

    function dragstarted(d) {
        d3.select(this).raise().classed("active", true);
    }

    function dragged(d) {
        d.x = d3.event.x;
        d.y = d3.event.y;
        d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
    }

    function dragended(d) {
        console.log(d3.event.x + " / " + d3.event.y);
        d3.select(this).classed("active", false);
    }

    var gItemEnter = RADAR.gItems.selectAll("g.item")
        .data(itemData)
        .enter()
        .append("g")
        .attr("class", "item")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    gItemEnter
        .append("circle")
        .attr("class", "item")
        .attr("r", 10)
        .attr("cx", 10)
        .attr("cy", 10)
        .style("fill", function (d) {
            return color(d.name);
        });

    gItemEnter
        .append("text")
        .attr("x", 0)
        .attr("y", 32)
        .text(function (d) {
            return d.name;
        })
};