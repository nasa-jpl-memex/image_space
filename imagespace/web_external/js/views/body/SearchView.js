imagespace.views.SearchView = imagespace.View.extend({
    events: {
        'click .im-add-user-data': function (event) {
            var id = $(event.currentTarget).attr('im-id'),
                image = this.imageIdMap[id];
            imagespace.userDataView.addUserImage(image);
        },

        'click .im-details': function (event) {
            var id = $(event.currentTarget).attr('im-id'),
                image = this.imageIdMap[id];
            this.imageDetailWidget = new imagespace.views.ImageDetailWidget({
                el: $('#g-dialog-container'),
                image: image,
                parentView: this
            });
            this.imageDetailWidget.render();
        },

        'click .im-find-similar': function (event) {
            var id = $(event.currentTarget).attr('im-id'),
                image = this.imageIdMap[id];
            imagespace.router.navigate('search/' + encodeURIComponent(image.imageUrl) + '/content', {trigger: true});

            this.$('.btn-lg').addClass('disabled');
            $(event.currentTarget).parent().find('.im-find-similar')
                .html('<i class="icon-spin5 animate-spin"></i>');
        },

        'mouseover .im-image-area': function (event) {
            $(event.currentTarget).find('.im-caption-content').removeClass('hidden');
        },

        'mouseout .im-image-area': function (event) {
            $(event.currentTarget).find('.im-caption-content').addClass('hidden');
        },

        'change .im-view-list': function (event) {
            console.log('view-list');
            localStorage.setItem('viewMode', 'list');
            this.viewMode = 'list';
            this.render();
        },

        'change .im-view-grid': function (event) {
            console.log('view-grid');
            localStorage.setItem('viewMode', 'grid');
            this.viewMode = 'grid';
            this.render();
        }
    },

    initialize: function (settings) {
        girder.cancelRestRequests('fetch');
        this.resLimit = 30;
        this.results = settings.results;
        this.viewMode = localStorage.getItem('viewMode') || 'grid';
        this.imageIdMap = {};
        this.results.forEach(_.bind(function (result) {
            result.imageUrl = result.id.startsWith('http') ? result.id : imagespace.solrIdToUrl(result.id);
            this.imageIdMap[result.id] = result;
        }, this));

        // Place in order if ids are explicit
        if ($('.im-search').length > 0) {
            var queryParts = $('.im-search').val().split(' '),
                idResults = [],
                idResultMap = {},
                remaining = [];
            queryParts.forEach(_.bind(function (part) {
                var partId = part.match(/id:\"(.*)\"/);
                if (partId && partId.length === 2 && this.imageIdMap[partId[1]]) {
                    idResults.push(this.imageIdMap[partId[1]]);
                    idResultMap[partId[1]] = true;
                }
            }, this));

            // Gather the rest
            this.results.forEach(function (result) {
                if (!idResultMap[result.id]) {
                    remaining.push(result);
                }
            });

            // Construct new result list with id results first
            this.results = idResults.concat(remaining);
        }

        this.render();
    },

    render: function () {
        this.$el.html(imagespace.templates.search({
            results: this.results,
            viewMode: this.viewMode,
            showText: true
        }));
        return this;
    }

});

imagespace.router.route('search/:query', 'search', function (query) {
    imagespace.headerView.render({query: query});
    $('.alert-info').html('Searching <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');

    girder.restRequest({
        path: 'imagesearch',
        data: {
            query: query,
            limit: 100
        }
    }).done(function (results) {
        girder.events.trigger('g:navigateTo', imagespace.views.SearchView, {
            results: results
        });
        $('.alert-info').addClass('hidden');
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
        if (results.length === 0) {
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
            performSearch(results[0]);
        }
    });
});
