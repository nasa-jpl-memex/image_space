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

    /**
     * Converts a solr ID to a viewable URL.
     * In other words, it replaces a prepended IMAGE_SPACE_SOLR_PREFIX
     * with an IMAGE_SPACE_PREFIX.
     **/
    solrIdToUrl: function (id) {
        var re = new RegExp("^" + imagespace.solrPrefix),
            file = id.replace(re, "");
        if (id.indexOf('cmuImages') !== -1) {
            file = 'cmuImages/' + file;
        }
        return imagespace.prefix + file;
    },

    urlToSolrId: function (url) {
        var re = new RegExp("^" + imagespace.prefix),
            file = url.replace(re, "");
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
    imagespace.headerView.render();
    $('#g-app-body-container').html(imagespace.templates[name]);
});
