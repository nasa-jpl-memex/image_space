var covalic = covalic || {};

_.extend(covalic, {
    models: {},
    collections: {},
    views: {},
    router: new Backbone.Router(),
    events: _.clone(Backbone.Events)
});

girder.router.enabled(false);
