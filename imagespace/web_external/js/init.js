var imagespace = imagespace || {};

_.extend(imagespace, {
    models: {},

    collections: {},

    views: {},

    router: new Backbone.Router(),

    events: _.clone(Backbone.Events),

    /**
     * imagespace.userData.images is a heterogeneous backbone
     * collection consisting of ImageModels and UploadedImageModels.
     **/
    userData: {
        images: []
    },

    /**
     * imagespace.searches is a mapping of strings to objects. The
     * string corresponds to the route appended to /search/:url/ and the
     * object must contain a search function which takes an image object (model?)
     * and is expected to return a ImageCollection. Additionally it can contain
     * niceName and tooltip properties for display purposes, and a displayContext property which
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
            tooltip: 'Search by the make of the camera used to take this image',
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
            tooltip: 'Search for other images with these dimensions',
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
            tooltip: 'Search for other images taken near this one',
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
     * Returns a list of search keys ordered by a locale compared sorting of the
     * actual searches niceName property.
     * @todo This could definitely be made simpler with more idiomatic underscore
     * usage.
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

        applicable.sort(function (a, b) {
            return imagespace.searches[a].niceName.localeCompare(imagespace.searches[b].niceName);
        });

        return applicable;
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

    // Returns empty string if no params in the query string
    getQueryParams: function () {
        var hash = Backbone.history.getHash(),
            paramsStartIndex = hash.indexOf('/params/');

        return (paramsStartIndex !== -1) ?
            hash.substr(paramsStartIndex).replace('/params/', '') : '';
    },

    // If not passed a query string, defaults to URL after /params/
    parseQueryString: function (queryString) {
        qs = girder.parseQueryString(queryString || imagespace.getQueryParams());

        if (_.has(qs, 'classifications')) {
            qs.classifications = qs.classifications.split(',');
        }

        if (_.has(qs, 'page')) {
            qs.page = parseInt(qs.page);
        }

        return qs;
    },

    createQueryString: function (obj) {
        var pairs = _.pairs(obj),
            first = _.first(pairs),
            rest = _.rest(pairs);

        return _.reduce(rest, function (memo, val) {
            return memo + '&' + val[0] + '=' + encodeURIComponent(val[1]);
        }, first[0] + '=' + encodeURIComponent(first[1]));
    },

    /**
     * Takes an object params and merges it with the existing parameters
     * in the URL query string and navigates there using the imagespace router.
     * Routes aren't triggered, it is a silent navigation.
     **/
    updateQueryParams: function (params) {
        var hash = Backbone.history.getHash(),
            paramsStartIndex = hash.indexOf('/params/'),
            qs = (paramsStartIndex !== -1) ?
                  hash.substr(paramsStartIndex).replace('/params/', '') : '',
            qsObj = imagespace.parseQueryString(qs),
            hashBeforeParams = (paramsStartIndex !== -1) ?
                                hash.substr(0, paramsStartIndex) : hash;

        _.extend(qsObj, params);

        imagespace.router.navigate(hashBeforeParams + '/params/' + imagespace.createQueryString(qsObj));
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
     * Ignores images which already exist as a Girder item.
     **/
    addUserImage: function (image, done, error) {
        if (!girder.currentUser) {
            return;
        }

        var noop = function () {};
        done = (_.isFunction(done)) ? done : noop;
        error = (_.isFunction(error)) ? error : noop;
        image.set('source_query', window.location.href);

        girder.restRequest({
            path: 'folder',
            data: {
                text: 'Private',
                parentType: 'user',
                parentId: girder.currentUser.id
            }
        }).done(function (folders) {
            var privateFolder = _.first(folders),
                imageId = _.has(image, 'id') ? image.id : image.get('id');

            if (privateFolder) {
                imagespace.userDataView.updateUserData(_.bind(function () {
                    if (!_.contains(_.invoke(imagespace.userData.images.models, 'get', 'id'),
                                    imageId)) {
                        var item = new girder.models.ItemModel({
                            name: imageId,
                            folderId: privateFolder._id
                        });

                        item.once('g:saved', function () {
                            image.set('item_id', item.attributes._id);
                            item._sendMetadata(image.attributes, done, error);
                            imagespace.userData.images.add(image);
                        }).once('g:error', error).save();
                    } else {
                        console.error('Item with id ' + imageId + ' already exists in your folder.');
                    }
                }));
            }
        });
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
    imagespace.headerView.render({
        activePage: window.location.hash
    });
    $('#g-app-body-container').html(imagespace.templates[name]());
});
