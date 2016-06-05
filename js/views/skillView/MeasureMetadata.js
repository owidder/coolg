'use strict';

angular.module(com_eosItServices_Dep.moduleName).factory("MeasureMetadata", function($q, iteraplan, funcs) {

    return function() {
        var HIDE_ATTRIBUTES = [
            "lastModificationTime",
            "Strategic drivers",
            "position",
            "id",
            "rank"
        ];

        var ADD_ATTRIBUTES = [
            {
                persistentName: "elementURI",
                listDescription: "Link iteraplan",
                showInList: true,
                postProcessor: iteraplanLinkProcessor
            }
        ];

        var USE_NAME_FOR = [
            "lastModificationTime",
            "lastModificationUser",
            "name"
        ];

        var that = this;
        var types;
        var projectAttributes;

        function readTypes(metadata) {
            types = {};
            metadata.forEach(function(clazz) {
                if(funcs.isDefined(clazz.name)) {
                    types[clazz.name] = clazz;
                }
            });
        }

        function processProjectAttribute(attribute) {
            function hide(attribute) {
                if(HIDE_ATTRIBUTES.indexOf(attribute.persistentName) < 0) {
                    attribute.showInList = true;
                }
            }

            function listDescription(attribute) {
                var index = USE_NAME_FOR.indexOf(attribute.persistentName);
                if(index >= 0) {
                    attribute.listDescription = attribute.name;
                }
                else {
                    attribute.listDescription = attribute.description;
                }
            }

            hide(attribute);
            listDescription(attribute);
        }

        function readProjectAttributes(metadata) {
            function addAttributes() {
                ADD_ATTRIBUTES.forEach(function(attribute) {
                    projectAttributes.push(attribute)
                });
            }

            function createAttributesFromClazz() {
                metadata.forEach(function(clazz) {
                    if(clazz.name == "Projekt" && clazz.type == "SubstantialTypeExpression") {
                        projectAttributes = clazz.features;
                        projectAttributes.map(processProjectAttribute);
                    }
                });
            }

            createAttributesFromClazz();
            addAttributes();
        }

        function getTypeWithName(name) {
            return types[name];
        }

        function getEnumEntry(name, value) {
            var enumEntry;
            var type = getTypeWithName(name);
            if(funcs.isDefined(type) && funcs.isDefined(type.literals)) {
                enumEntry = funcs.searchObjectInArray(type.literals, value, "name");
            }

            return enumEntry;
        }

        function resolveEnum(name, value) {
            var resolved = value;
            var enumEntry = getEnumEntry(name, value);
            if(funcs.isDefined(enumEntry)) {
                resolved = enumEntry.description.length > 0 ? enumEntry.description : enumEntry.name;
            }

            return resolved;
        }

        function getAllEnumValues(name) {
            var values = [];
            var type = getTypeWithName(name);
            if(funcs.isDefined(type) && funcs.isDefined(type.literals)) {
                type.literals.forEach(function(literal) {
                    values.push({
                        id: literal.persistentName,
                        text: literal.description
                    })
                });
            }

            return values;
        }

        function getColorForEnumValue(name, value) {
            var color;
            var enumEntry = getEnumEntry(name, value);
            if(funcs.isDefined(enumEntry)) {
                color = enumEntry.color;
            }

            return color;
        }

        function isHyperLink(attributeValue) {
            return (funcs.isDefined(attributeValue) && funcs.isDefined(attributeValue.indexOf) && attributeValue.indexOf("http") == 0);
        }

        function iteraplanLinkProcessor(value) {
            var newValue = value;
            var OLD_LINK_PART = "api/data/Project";
            var NEW_LINK_PART = "show/project";
            if(value.indexOf(OLD_LINK_PART) > -1) {
                newValue = value.replace(OLD_LINK_PART, NEW_LINK_PART);
            }

            return newValue;
        }

        function getAttributesForMeasure(measure) {
            var attributes = [];
            projectAttributes.forEach(function(projectAttribute) {
                var projectAttributeName = projectAttribute.persistentName;
                var projectAttributeValue = funcs.isDefined(measure) ? resolveEnum(projectAttributeName, measure[projectAttributeName]) : "";
                if(funcs.isDefined(projectAttribute.postProcessor)) {
                    projectAttributeValue = projectAttribute.postProcessor(projectAttributeValue);
                }
                var projectAttributeValueIsHyperLink = isHyperLink(projectAttributeValue);
                if(funcs.isDefined(projectAttributeValue)) {
                    attributes.push({
                        id: projectAttributeName,
                        text: projectAttribute.listDescription,
                        value: projectAttributeValue,
                        showInList: projectAttribute.showInList,
                        isHyperLink: projectAttributeValueIsHyperLink
                    });
                }
            });

            return attributes;
        }

        var deferred = $q.defer();

        iteraplan.callApi("/api/metamodel").then(function(metadata) {
            readTypes(metadata);
            readProjectAttributes(metadata);
            that.types = types;
            that.projectAttributes = projectAttributes;
            deferred.resolve();
        });

        this.initialized = deferred.promise;

        that.getTypeWithName = getTypeWithName;
        that.resolveEnum = resolveEnum;
        that.getAttributesForMeasure = getAttributesForMeasure;
        that.getEnumEntry = getEnumEntry;
        that.getAllEnumValues = getAllEnumValues;
        that.getColorForEnumValue = getColorForEnumValue;
        that.iteraplanLinkProcessor = iteraplanLinkProcessor;

        that.projectAttributes = projectAttributes;
    };
});