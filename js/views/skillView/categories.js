'use strict';

bottle.factory("$categories", function(container) {

    function shorten(category) {
        var shortened;

        switch (category) {
            case "Ohne Zuordnung":
                shortened = "?";
                break;

            case "Sonstiges (Methodik)":
                shortened = "Methodik";
                break;

            case "Sonstiges (Technologie)":
                shortened = "Technologie";
                break;

            default:
                shortened = category;
        }

        return shortened;
    }

    return {
        shorten: shorten
    }
});