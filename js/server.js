'use strict';

/* global bottle */
/* global $ */
/* global _ */

bottle.factory("server", function (container) {

    function sendRadar(radar) {
        var p = new container.SimplePromise();
        if(!_.isEmpty(container.context.serverPath) && radar != null) {
            var radarStr = JSON.stringify(radar);
            $.ajax({
                type: "POST",
                url: container.context.serverPath + "/radar",
                contentType: "application/json",
                dataType: "text",
                data: radarStr,
                success: function (data) {
                    p.resolve(data);
                }
        });

            return p.promise;
        }
    }

    function receiveRadar() {
        var p = new container.SimplePromise();
        if(!_.isEmpty(container.context.serverPath)) {
            $.ajax({
                type: "GET",
                url: container.context.serverPath + "/radar",
                accepts: "application/json",
                dataType: "text",
                success: function (data) {
                    p.resolve(data);
                }
            });
        }

        return p.promise;
    }
    
    function sendItemMove() {
        
    }

    return {
        sendRadar: sendRadar,
        receiveRadar: receiveRadar
    }
});