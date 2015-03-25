var imagespace = imagespace || {};

_.extend(imagespace, {
    models: {},
    collections: {},
    views: {},
    router: new Backbone.Router(),
    events: _.clone(Backbone.Events),
    userData: {
        images: []
    }
});

girder.router.enabled(false);
