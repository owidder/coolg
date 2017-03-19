'use strict';

/* global bottle */
/* global PouchDB */

bottle.factory("db", function (container) {
    var SimplePromise = container.SimplePromise;

    var db = new PouchDB('radar');

    function getId() {
        var radarId = container.context.radarId;
        var tenantId = container.context.tenantId;

        return tenantId + "-" + radarId;
    }

    function newRadar() {
        return {
            _id: getId(),
            radarId: container.context.radarId,
            tenantId: container.context.tenantId
        }
    }

    function load() {
        var p = new SimplePromise();

        if(db != null) {
            db.get(getId(), function (err, radar) {
                if(err) {
                    p.resolve(newRadar());
                }
                else {
                    p.resolve(radar);
                }
            });
        }
        else {
            p.reject();
        }

        return p.promise;
    }

    function save(name, value) {
        var p = new SimplePromise();

        load().then(function (radar) {
            radar[name] = value;
            db.put(radar);
            p.resolve();
        });

        return p.promise;
    }

    function deleteFromDb() {
        var p = new SimplePromise();

        load().then(function (radar) {
            if(radar._rev != null) {
                db.remove(radar, function () {
                    p.resolve();
                })
            }
            else {
                p.resolve();
            }
        });

        return p.promise;
    }

    return {
        load: load,
        save: save,
        deleteFromDb: deleteFromDb
    }
});
