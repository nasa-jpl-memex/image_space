var hello_app = hello_app || {};

_.extend(hello_app, {
    models: {},
    collections: {},
    views: {},
    router: new Backbone.Router(),
    events: _.clone(Backbone.Events)
});

girder.router.enabled(false);
