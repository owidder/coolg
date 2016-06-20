var w = 960,
    h = 500,
    color = d3.scale.category20c();

var treemap = d3.layout.treemap()
    .padding(4)
    .size([w, h])
    .value(function(d) {
        return d.expertCount;
    });

var svg = d3.select("body").append("svg:svg")
    .style("width", w)
    .style("height", h)
    .append("svg:g")
    .attr("transform", "translate(-.5,-.5)");

d3.json("skills.json", function(json) {
    var cell = svg.data([json]).selectAll("g")
        .data(treemap)
        .enter().append("svg:g")
        .attr("class", "cell")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    cell.append("svg:rect")
        .attr("width", function(d) {
            return d.dx;
        })
        .attr("height", function(d) {
            return d.dy;
        })
        .style("fill", function(d) {
            return color(d.category);
        });

    cell.append("svg:text")
        .attr("x", function(d) {
            return d.dx / 2;
        })
        .attr("y", function(d) {
            return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("font-size", function(d) {
            var quotx = d.dx / d.name.length;
            var quoty = d.dy / 2;
            return Math.min(quotx, quoty) + "px";
        })
        .text(function(d) {
            return d.children ? null : d.name;
        });
});
