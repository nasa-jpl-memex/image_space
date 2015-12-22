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
     * imagespace.searches is a mapping of strings to objects. The
     * string corresponds to the route appended to /search/:url/ and the
     * object must contain a search function which takes an image object (model?)
     * and is expected to return a SearchResultCollection. Additionally it can contain
     * a niceName property for display purposes, and a displayContext property which
     * takes an image model and determines whether or not the search should be displayed
     * in that context.
     **/
    searches: {
        ad: {
            search: function (image) {
                return imagespace.getSearchResultCollectionFromQuery('ads_id:"' + image.ads_id + '"');
            },
            niceName: 'Ad',
            displayContext: function (image) {
                return image.has('ads_id');
            }
        },
        camera: {
            search: function (image) {
                return imagespace.getSearchResultCollectionFromQuery(
                    'camera_serial_number:"' + image.camera_serial_number + '"');
            },
            niceName: 'Camera',
            displayContext: function (image) {
                return image.has('camera_serial_number');
            }
        },
        size: {
            search: function (image) {
                return imagespace.getSearchResultCollectionFromQuery(
                    'tiff_imagelength:' + image.tiff_imagelength + ' AND tiff_imagewidth:' + image.tiff_imagewidth);
            },
            niceName: 'Size',
            displayContext: function (image) {
                return image.has('tiff_imagelength') && image.has('tiff_imagewidth');
            }
        },
        location: {
            search: function (image) {
                var geoLatDelta = image.geo_lat < 0 ? -1 : 1,
                    geoLongDelta = image.geo_long < 0 ? -1 : 1,
                    latRange = [image.geo_lat - geoLatDelta, image.geo_lat + geoLatDelta],
                    longRange = [image.geo_long - geoLongDelta, image.geo_long + geoLongDelta];

                return imagespace.getSearchResultCollectionFromQuery(
                    'geo_lat:[' + latRange[0] + ' TO ' + latRange[1] + '] AND geo_long:[' + longRange[0] + ' TO ' + longRange[1] + ']'
                );
            },
            niceName: 'Location',
            displayContext: function (image) {
                return image.has('geo_lat');
            }
        }
    },

    // Determines what search to use for similarity by default (magnifying glass icon)
    defaultSimilaritySearch: null,

    /**
     * Returns a search result collection from a standard query (i.e. something
     * that could be typed into the search bar). This is a common use case for pre-
     * preparing searches.
     **/
    getSearchResultCollectionFromQuery: function (query) {
        return new imagespace.collections.SearchResultCollection(null, {
            params: {
                query: query
            }
        });
    },

    /**
     * Takes an image model and determines which searches are applicable
     * given their displayContext. (defaults to true)
     **/
    getApplicableSearches: function (image) {
        var applicable = _.filter(_.keys(imagespace.searches), function (key) {
            var search = imagespace.searches[key];

            if (!_.has(search, 'displayContext')) {
                return true;
            } else if (_.isFunction(search.displayContext)) {
                return search.displayContext(image);
            } else {
                return search.displayContext;
            }
        });

        return _.pick(imagespace.searches, applicable);
    },

    /**
     * Converts a solr ID to a viewable URL.
     * In other words, it replaces a prepended IMAGE_SPACE_SOLR_PREFIX
     * with an IMAGE_SPACE_PREFIX.
     **/
    solrIdToUrl: function (id) {
        var re = new RegExp("^" + imagespace.solrPrefix),
            file = id.replace(re, "");

        return imagespace.prefix + file;
    },

    /**
     * Converts a viewable url to the appropriate solr ID.
     * It replaces a prepended IMAGE_SPACE_PREFIX with an
     * IMAGE_SPACE_SOLR_PREFIX.
     **/
    urlToSolrId: function (url) {
        var re = new RegExp("^" + imagespace.prefix),
            file = url.replace(re, "");

        if (file.length < 30) {
            return;
        }

        return imagespace.solrPrefix + file;
    },

    /**
     * Processes a response (from a collection fetch) to
     * include a numFound attribute, and puts the elements in the docs
     * property. This is because certain endpoints return numDocs and docs (solr)
     * while others don't, though we still need to have access to them for pagination.
     **/
    processResponse: function (resp) {
        return {
            numFound: _.has(resp, 'numFound') ? resp.numFound : resp.length,
            docs: _.has(resp, 'docs') ? resp.docs : resp
        };
    }
});

girder.router.enabled(false);

imagespace.router.on('route', function (route, params) {
    // Add tracking for google analytics if ga function exists
    if (_.isFunction(ga)) {
        ga('set', 'page', route + '/' + params.join('/'));
        ga('send', 'pageview');
    }
});

imagespace.router.route('page/:name', 'page', function (name) {
    imagespace.headerView.render();
    $('#g-app-body-container').html(imagespace.templates[name]);
});
