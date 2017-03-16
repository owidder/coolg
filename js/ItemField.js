'use strict';

/* global RADAR */
/* global SimplePromise */

var ItemField = function () {

    var ID_ITEM_DATA = "itemData";

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
        "Spring Boot",
        "Enzyme"
    ];

    var itemData = itemNames.map(function(name, i) {
        return {
            x: i < 11 ? 20 : 160,
            y: i < 11 ? i*40 + 5 : (i-10) * 40 + 5,
            name: name
        }
    });

    function readItemsFromDb() {
        var p = new SimplePromise();
        if(RADAR.db != null) {
            RADAR.db.get(ID_ITEM_DATA, function (err, doc) {
                if(err) {
                    console.log(err);
                    p.resolve(null);
                }
                else {
                    p.resolve(doc);
                }
            });
        }
        else {
            p.reject();
        }

        return p.promise;
    }

    function save() {
        readItemsFromDb().then(function (doc) {
            if(doc != null) {
                doc.itemData = itemData;
                RADAR.db.put(doc);
            }
            else {
                RADAR.db.put({_id: ID_ITEM_DATA, itemData: itemData});
            }
        });
    }

    function deleteItemsFromDb() {
        var p = new SimplePromise();
        readItemsFromDb().then(function (doc) {
            if(doc != null) {
                RADAR.db.remove(doc);
            }
            p.resolve();
        }, p.resolve);

        return p.promise;
    }

    function loadItems() {
        readItemsFromDb().then(function (doc) {
            if(doc != null && doc.itemData != null) {
                itemData = doc.itemData;
                draw();
            }
        });
    }

    function loadLatest() {
        if(RADAR.db != null) {
            RADAR.db.get(ID_ITEM_DATA, function(err, doc) {
                console.dir(doc);
                if(doc != null) {
                    itemData = doc.itemData;
                    draw();
                }
            });
        }
    }

    function draw() {
        function dragstarted(d) {
            d3.select(this).raise().classed("active", true);
        }

        function dragged(d) {
            d.x = d3.event.x;
            d.y = d3.event.y;
            d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
        }

        function dragended(d) {
            save();
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

        RADAR.gItems.selectAll("g.item")
            .transition()
            .duration(1000)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

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
    }

    this.save = save;
    this.loadLatest = loadLatest;
    this.loadItems = loadItems;
    this.deleteItemsFromDb = deleteItemsFromDb;

    draw();
};