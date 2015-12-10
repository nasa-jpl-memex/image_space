var imagespace = imagespace || {};

_.extend(imagespace, {
    models: {},

    collections: {},

    views: {},

    router: new Backbone.Router(),

    events: _.clone(Backbone.Events),

    userData: {
        images: []
    },

    solrIdToUrl: function (id) {
        var parts = id.split('/'),
            file = parts[parts.length - 1];
        if (id.indexOf('cmuImages') !== -1) {
            file = 'cmuImages/' + file;
        }
        return imagespace.prefix + file;
    },

    urlToSolrId: function (url) {
        var parts = url.split('/'),
            file = parts[parts.length - 1];
        if (file.length < 30) {
            return;
        }
        if (url.indexOf('cmuImages') !== -1) {
            file = 'cmuImages/' + file;
        }
        return imagespace.solrPrefix + file;
    }
});

girder.router.enabled(false);

imagespace.router.route('page/:name', 'page', function (name) {
    $('#g-app-body-container').html(imagespace.templates[name]);
});
