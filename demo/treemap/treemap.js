var w = 960,
    h = 500,
    color = d3.scale.category20c();


// from: http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-url-parameter
var queryString = function () {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

function yaChanged() {
    var ya = $("input[name='ya']:checked").val();
    draw(ya);
}

function draw(ya) {
    var treemap = d3.layout.treemap()
        .padding(4)
        .size([w, h])
        .value(function(d) {
            return d[queryString.ya];
        });

    var cellEnter = svg.data([json]).selectAll("g")
        .data(treemap, function(d) {
            return d.name;
        })
        .enter().append("svg:g")
        .attr("class", "cell");

    svg.selectAll("g.cell")
        .transition()
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    cellEnter.append("svg:rect")
        .attr("class", "skill")
        .style("fill", function(d) {
            return color(d.category);
        });

    svg.selectAll("rect.skill")
        .transition()
        .attr("width", function(d) {
            return d.dx;
        })
        .attr("height", function(d) {
            return d.dy;
        });

    cellEnter.append("svg:text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) {
            return d.children ? null : d.name;
        });

    svg.selectAll("text.skill")
        .transition()
        .attr("x", function(d) {
            return d.dx / 2;
        })
        .attr("y", function(d) {
            return d.dy / 2;
        })
        .attr("font-size", function(d) {
            var quotx = d.dx / d.name.length;
            var quoty = d.dy / 2;
            return Math.min(quotx, quoty) + "px";
        })
}


d3.json("flatSkills.json", function(json) {
    var svg = d3.select("#graph").append("svg:svg")
        .style("width", w)
        .style("height", h)
        .append("svg:g")
        .attr("transform", "translate(-.5,-.5)");

    yaChanged();
});
