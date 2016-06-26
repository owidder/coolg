'use strict';

bottle.factory("constants", function(container) {

    return {
        START_DATE: "1980-01-01",
        END_DATE: "2015-03-01",
        STOCK_PROPERTY_NAME: "Close",
        ATTRIBUTE_SKILL: "Skill",
        ATTRIBUTE_ANZAHL_EXPERTEN: "expertCount",
        ATTRIBUTE_ANZAHL_MITARBEITER: "count",
        ATTRIBUTE_MITTLERE_BEWERTUNG: "ma",
        ATTRIBUTE_MITTLERE_DAUER: "md",
        COLUMN_SKILL_UNTERKATEGORIE: "Skill-Unterkategorie",
        COLUMN_STANDORT: "Standort",
        COLUMN_BEWERTUNG: "Bewertung"
    }
});
