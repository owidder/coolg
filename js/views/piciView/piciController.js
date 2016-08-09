'use strict';

com_geekAndPoke_coolg.PICI_CONTROLLER = "piciController";

angular.module(com_geekAndPoke_coolg.moduleName).controller(com_geekAndPoke_coolg.PICI_CONTROLLER, function() {
    var dimensions  = bottle.container.dimensions;
    var funcs  = bottle.container.funcs;

    var width = dimensions.width(-50);
    var height = dimensions.height(-70);

    function computeArea(element) {
        var rect = element.getBoundingClientRect();
        return rect.width * rect.height;
    }

    function addAreaToMap(clazz, area, areaMap) {
        if(isNaN(areaMap[clazz])) {
            areaMap[clazz] = 0;
        }

        areaMap[clazz] += area;
    }

    function computeAreaMap() {
        var areaMap = {};

        d3.selectAll("svg > path")
            .each(function() {
                var area = computeArea(this);
                var clazz = this.getAttribute("class");
                addAreaToMap(clazz, area, areaMap);
            });

        return areaMap;
    }

    function createFlatTreeFromAreaMap(areaMap) {
        var flatTree = {
            name: "root",
            children: [],
            indexes: {}
        };

        funcs.forEachKeyAndVal(areaMap, function(clazz, area) {
            flatTree.indexes[clazz] = flatTree.children.length;
            flatTree.children.push({
                name: clazz,
                area: area
            });
        });

        return flatTree;
    }

    function createTreeMapDataFromFlatTree(flatTree) {
        var treeMap = d3.layout.treemap()
            .size([width, height])
            .value(function(d) {
                return d.area
            });

        var treeMapData = treeMap(flatTree);

        return treeMapData;
    }

    d3.xml("rsrc/picasso1.svg").mimeType("image/svg+xml").get(function(error, xml) {
        if (error) throw error;
        document.querySelector("#pici").appendChild(xml.documentElement);
        var areaMap = computeAreaMap();
        var flatTree = createFlatTreeFromAreaMap(areaMap);
        var treeMapData = createTreeMapDataFromFlatTree(flatTree);

        console.log(treeMapData);
    });

});