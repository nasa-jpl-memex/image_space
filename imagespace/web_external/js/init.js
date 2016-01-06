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
     * and is expected to return a ImageCollection. Additionally it can contain
     * a niceName property for display purposes, and a displayContext property which
     * takes an image model and determines whether or not the search should be displayed
     * in that context.
     **/
    searches: {
        make: {
            search: function (image) {
                return imagespace.getImageCollectionFromQuery(
                    'make_t_md:"' + image.get('make_t_md') + '"');
            },
            niceName: 'Camera Make',
            displayContext: function (image) {
                return image.has('make_t_md');
            }
        },
        size: {
            search: function (image) {
                var lengthKey = 'tiff\\:imagelength_l_md',
                    widthKey = 'tiff\\:imagewidth_l_md';

                return imagespace.getImageCollectionFromQuery(
                    lengthKey + ':' + image.get('tiff:imagelength_l_md') + ' AND ' + widthKey + ':' + image.get('tiff:imagewidth_l_md'));
            },
            niceName: 'Size',
            displayContext: function (image) {
                return image.has('tiff:imagelength_l_md') && image.has('tiff:imagewidth_l_md');
            }
        },
        location: {
            search: function (image) {
                var latKey = 'geo:lat_d_md',
                    longKey = 'geo:long_d_md',
                    geoLatDelta = image.get(latKey) < 0 ? -1 : 1,
                    geoLongDelta = image.get(longKey) < 0 ? -1 : 1,
                    latRange = [image.get(latKey) - geoLatDelta, image.get(latKey) + geoLatDelta],
                    longRange = [image.get(longKey) - geoLongDelta, image.get(longKey) + geoLongDelta];

                return imagespace.getImageCollectionFromQuery(
                    'geo\\:lat_d_md:[' + latRange[0] + ' TO ' + latRange[1] + '] AND geo\\:long_d_md:[' + longRange[0] + ' TO ' + longRange[1] + ']'
                );
            },
            niceName: 'Location',
            displayContext: function (image) {
                return image.has('geo:lat_d_md') && image.has('geo:long_d_md');
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
    getImageCollectionFromQuery: function (query) {
        return new imagespace.collections.ImageCollection(null, {
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

    oppositeCaseFilename: function (filename) {
        var parts = filename.split('/');

        if (parts[parts.length - 1] === parts[parts.length - 1].toLowerCase()) {
            parts[parts.length - 1] = parts[parts.length - 1].toUpperCase();
        } else {
            parts[parts.length - 1] = parts[parts.length - 1].toLowerCase();
        }

        return parts.join('/');
    },

    /**
     * Processes a response (from a collection fetch) to
     * include a numFound attribute, and puts the elements in the docs
     * property. This is because certain endpoints return numDocs and docs (solr)
     * while others don't, though we still need to have access to them for pagination.
     * Additionally this converts all documents to Image models.
     **/
    processResponse: function (resp) {
        return {
            numFound: _.has(resp, 'numFound') ? resp.numFound : resp.length,
            docs: _.map(_.has(resp, 'docs') ? resp.docs : resp,
                        function (doc) {
                            return new imagespace.models.ImageModel(doc);
                        })
        };
    },

    // Default blur setting must be one of always, never, or hover
    defaultBlurSetting: 'hover',

    updateBlurSetting: function (val) {
        localStorage.setItem('im-blur', val);

        var options = {
            always: 'img.im-blur { -webkit-filter: blur(10px); filter: blur(10px) }',
            never: '',
            hover: 'img.im-blur { -webkit-filter: blur(10px); filter: blur(10px) }' +
                '\nimg.im-blur:hover { -webkit-filter: blur(0px); filter: blur(0px) }'
        };

        $('#blur-style').text(options[val]);
    },

    /**
     * Takes an image model and stores it as a Girder item for the current user.
     **/
    addUserImage: function (image, done, error) {
        if (!girder.currentUser) {
            return;
        }

        var noop = function () {};
        done = (_.isFunction(done)) ? done : noop;
        error = (_.isFunction(error)) ? error : noop;
        image.source_query = window.location.href;

        girder.restRequest({
            path: 'folder',
            data: {
                text: 'Private',
                parentType: 'user',
                parentId: girder.currentUser.id
            }
        }).done(function (folders) {
            var privateFolder = _.first(folders);

            if (privateFolder) {
                var item = new girder.models.ItemModel({
                    name: _.has(image, 'id') ? image.id : image.get('id'),
                    folderId: privateFolder._id
                });

                item.once('g:saved', function () {
                    image.set('item_id', item.attributes._id);
                    item._sendMetadata(image.attributes, done, error);
                    imagespace.userData.images.add(image);
                }).once('g:error', error).save();
            }
        });
    }
});

girder.router.enabled(false);

imagespace.router.route('page/:name', 'page', function (name) {
    imagespace.headerView.render();
    $('#g-app-body-container').html(imagespace.templates[name]({
        imagespace: imagespace
    }));
});
