'use strict';

com_geekAndPoke_coolg.SKILL_CONTROLLER_TEST = "skillControllerTest";

angular.module(com_geekAndPoke_coolg.moduleName).controller(com_geekAndPoke_coolg.SKILL_CONTROLLER_TEST, function($scope) {
    var $pivot = bottle.container.pivot;

    var pivot = new $pivot.Pivot("rsrc/skills.txt");
});