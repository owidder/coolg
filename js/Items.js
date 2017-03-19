'use strict';

/* global Handlebars */
/* global d3 */

bottle.factory("Items", function (container) {
    var SimplePromise = container.SimplePromise;
    var db = container.db;
    var util = container.util;

    var Items = function (field) {

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
            var half = items.length / 2;
            var notMovedCtr = 0;
            items = items.map(function (item, i) {
                var newX = item.moved != null ? item.x : (notMovedCtr < half ? 20 : 160);
                var newY = item.moved != null ? item.y : (notMovedCtr < half ? notMovedCtr*40 + 5 : (notMovedCtr-half) * 40 + 5);
                if(item.moved == null) {
                    notMovedCtr++;
                }
                var extendedItem = Object.assign({}, item);
                extendedItem.x = newX;
                extendedItem.y = newY;
                extendedItem.itemNo = i;

                return extendedItem;
            })
        }

        function save() {
            db.save("items", items);
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

        function itemFromId(id) {
            return items.find(function (item) {
                return item.id == id;
            });
        }

        function removeItem(id) {
            items = items.filter(function (item) {
                return  item.id != id;
            });
            initItems();
            draw();
            refreshItemForm();
            save();
        }

        function addItemAfterId(id) {
            var item = itemFromId(id);
            var index = item.itemNo;
            items.splice(index+1, 0, {
                name: "",
                id: "item" + util.uid()
            });

            initItems();
            draw();
            refreshItemForm();
            save();
        }

        function load() {
            db.load().then(function (radar) {
                if(radar != null && radar.items != null) {
                    items = radar.items;
                    initItems();
                    draw();
                    refreshItemForm();
                }
            });
        }

        function refreshItemForm() {
            $("#form-items").empty();
            var inputItemsTemplateScript = $("#input-items").html();
            var inputItemsTemplate = Handlebars.compile(inputItemsTemplateScript);
            var ctx = {
                items: items
            };
            var inputItemsHtml = inputItemsTemplate(ctx);
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
                d.moved = "yes";
                d3.select(this).classed("active", false);
                save();
                initItems();
                draw();
            }

            var gItemData = field.gItems.selectAll("g.item").data(items, function (d) {
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

            var gItemAll = field.gItems.selectAll("g.item");

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

            gItemAll.selectAll("text").data(function (d) {
                return [d];
            });

            gItemAll.selectAll("text")
                .text(function (d) {
                    return d.name;
                });
        }

        this.save = save;
        this.load = load;
        this.changeItemName = changeItemName;
        this.addItemAfterId = addItemAfterId;
        this.removeItem = removeItem;

        initItems();
        draw();
        refreshItemForm();
    };

    return Items;
});

