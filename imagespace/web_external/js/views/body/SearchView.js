imagespace.views.SearchView = imagespace.View.extend({
    events: {
        'change .im-view-list': function (event) {
            localStorage.setItem('viewMode', 'list');
            this.viewMode = 'list';
            this.render();
        },

        'change .im-view-grid': function (event) {
            localStorage.setItem('viewMode', 'grid');
            this.viewMode = 'grid';
            this.render();
        }
    },

    initialize: function (settings) {
        girder.cancelRestRequests('fetch');
        this.$el = window.app.$('#g-app-body-container');
        this.collection = settings.collection;
        this.resLimit = 30; // @Todo is this used anywhere?
        this.viewMode = localStorage.getItem('viewMode') || 'grid';
        this.collection.on('g:changed', _.bind(this.render, this));
        this.collection.fetch();
    },

    render: function () {
        this.$el.html(imagespace.templates.search({
            viewMode: this.viewMode,
            showText: true,
            collection: this.collection
        }));

        this.collection.each(function (image) {
            var imageView = new imagespace.views.ImageView({
                model: image,
                viewMode: this.viewMode,
                parentView: this
            });

            this.$('#im-search-results').append(imageView.render().el);
        }, this);

        return this;
    }

});

imagespace.router.route('search/:query', 'search', function (query) {
    imagespace.headerView.render({query: query});
    $('.alert-info').html('Searching <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');

    var resultsColl = new imagespace.collections.SearchResultCollection(null);

    _.extend(resultsColl, {
        params: {
            query: query
        }
    });

    new imagespace.views.SearchView({
        collection: resultsColl,
        parentView: window.app
    });
});

imagespace.router.route('search/:url/:mode', 'search', function (url, mode) {
    // Replace Girder token with current session's token if necessary
    var parts = url.split('&token=');
    if (parts.length === 2) {
        url = parts[0] + '&token=' + girder.cookie.find('girderToken');
    }

    var performSearch = function (image) {
        image.imageUrl = url;

        imagespace.headerView.render({url: url, mode: mode, image: image});

        if (mode === 'content') {
            $('.alert-info').html('Finding images with similar content <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');

            q = {
                url: url,
                limit: 100
            }
            if (image.histogram) {
                q.histogram = JSON.stringify(image.histogram);
            }
            girder.restRequest({
                path: 'imagecontentsearch',
                data: q
            }).done(function (results) {
                girder.events.trigger('g:navigateTo', imagespace.views.SearchView, {
                    results: results
                });
                $('.alert-info').addClass('hidden');
                imagespace.userDataView.render();
            });
            return;
        }

        if (mode === 'background') {
            $('.alert-info').html('Finding images with similar background <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');

            girder.restRequest({
                path: 'imagebackgroundsearch',
                data: {
                    url: url
                }
            }).done(function (results) {
                girder.events.trigger('g:navigateTo', imagespace.views.SearchView, {
                    results: results
                });
                $('.alert-info').addClass('hidden');
                imagespace.userDataView.render();
            });
            return;
        }

        if (mode === 'dynamics') {
            $('.alert-info').html('Finding images with similar domain dynamics <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');

            girder.restRequest({
                path: 'imagedomaindynamicssearch',
                data: {
                    url: url
                }
            }).done(_.bind(function (results) {
                girder.events.trigger('g:navigateTo', imagespace.views.SearchView, {
                    results: results
                });
                $('.alert-info').addClass('hidden');
                imagespace.userDataView.render();
            }, this));
        }

        if (mode === 'ad') {
            $('.alert-info').html('Finding images in same ad <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');

            q = 'ads_id:"' + image.ads_id + '"';
        } else if (mode === 'camera') {
            $('.alert-info').html('Finding images with same camera serial number <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');

            q = 'camera_serial_number:"' + image.camera_serial_number + '"';
        } else if (mode === 'size') {
            $('.alert-info').html('Finding images of the same size <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');

            q = 'tiff_imagelength:' + image.tiff_imagelength + ' AND tiff_imagewidth:' + image.tiff_imagewidth;
        } else if (mode === 'location') {
            var geoLatDelta = image.geo_lat < 0 ? -1 : 1,
                geoLongDelta = image.geo_long < 0 ? -1 : 1,
                latRange = [image.geo_lat - geoLatDelta, image.geo_lat + geoLatDelta],
                longRange = [image.geo_long - geoLongDelta, image.geo_long + geoLongDelta];

            $('.alert-info').html('Finding images taken nearby <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');

            q = 'geo_lat:[' + latRange[0] + ' TO ' + latRange[1] + '] AND geo_long:[' + longRange[0] + ' TO ' + longRange[1] + ']';
        }

        console.log(q);
        girder.restRequest({
            path: 'imagesearch',
            data: {
                query: q,
                limit: 100
            }
        }).done(function (results) {
            girder.events.trigger('g:navigateTo', imagespace.views.SearchView, {
                results: results
            });
            $('.alert-info').addClass('hidden');
            imagespace.userDataView.render();
        });
    };

    girder.restRequest({
        path: 'imagesearch',
        data: {
            query: 'id:"' + imagespace.urlToSolrId(url) + '"'
        }
    }).done(function (results) {
        var q;
        if (_.size(results.docs) === 0) {
            $('.alert-info').html('Computing features <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');
            girder.restRequest({
                path: 'imagefeatures',
                data: {
                    url: url
                },
                method: 'POST'
            }).done(function (features) {
                $('.alert-info').addClass('hidden');
                performSearch(features);
            });
        } else {
            performSearch(_.first(results.docs));
        }
    });
});
