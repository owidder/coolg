'use strict';

/* global RADAR */
/* global SimplePromise */

var ItemField = function () {

    var ID_ITEM_DATA = "itemData";

    var color = d3.scaleOrdinal(d3["schemeCategory20"]);

    var DEMO_ITEMS = [
        {name: "Digitalization", id: "item0"},
        {name: "Microservices", id: "item1"},
        {name: "Docker Swarm", id: "item2"},
        {name: "Consul", id: "item3"},
        {name: "Cloud Computing", id: "item4"},
        {name: "Gamification", id: "item5"},
        {name: "Infrastructure as Code", id: "item6"},
        {name: "NoSQL", id: "item7"},
        {name: "Grafana", id: "item8"},
        {name: "Let's Encrypt", id: "item9"},
        {name: "Webpack", id: "item10"},
        {name: "React", id: "item11"},
        {name: "Angular 2", id: "item12"},
        {name: "D3", id: "item13"},
        {name: "Cloud IDE", id: "item14"},
        {name: "Clojure", id: "item15"},
        {name: "BYOD", id: "item16"},
        {name: "Ember", id: "item17"},
        {name: "Redux", id: "item18"},
        {name: "Spring Boot", id: "item19"},
        {name: "Enzyme", id: "item20"}
    ];

    var items = DEMO_ITEMS;

    function initItems() {
        items = items.map(function (item, i) {
            var newX = item.moved != null ? item.x : (i < 11 ? 20 : 160);
            var newY = item.moved != null ? item.y : (i < 11 ? i*40 + 5 : (i-10) * 40 + 5);
            return {
                name: item.name,
                id: item.id,
                x: newX,
                y: newY
            }
        })
    }

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
                doc.items = items;
                RADAR.db.put(doc);
            }
            else {
                RADAR.db.put({_id: ID_ITEM_DATA, items: items});
            }
        });
    }

    function changeItemName(id, newName) {
        items.forEach(function (item) {
            if(item.id == id) {
                item.name = newName;
            }
        });
        draw();
        save();
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
            if(doc != null && doc.items != null) {
                items = doc.items;
                initItems();
                draw();
            }
        });
    }

    function refreshItemForm() {
        $("#form-items").empty();
        var inputItemsTemplateScript = $("#input-items").html();
        var inputItemsTemplate = Handlebars.compile(inputItemsTemplateScript);
        var context = {
            items: items
        };
        var inputItemsHtml = inputItemsTemplate(context);
        $("#form-items").append(inputItemsHtml);
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
            d.moved = true;
            save();
            d3.select(this).classed("active", false);
        }

        var gItemData = RADAR.gItems.selectAll("g.item").data(items, function (d) {
            return d.id;
        });

        var gItemEnter = gItemData.enter()
            .append("g")
            .attr("class", "item")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        gItemData.exit().remove();

        var gItemAll = RADAR.gItems.selectAll("g.item");

        gItemAll
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
            .attr("y", 32);

        gItemAll.selectAll("text")
            .text(function (d) {
                return d.name;
            });
    }

    this.save = save;
    this.loadItems = loadItems;
    this.deleteItemsFromDb = deleteItemsFromDb;
    this.changeItemName = changeItemName;

    initItems();
    draw();
    refreshItemForm();
};