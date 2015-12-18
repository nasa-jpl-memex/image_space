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
        this.viewMode = localStorage.getItem('viewMode') || 'grid';
        this.collection.on('g:changed', _.bind(this.render, this));
        this.collection.fetch(settings.collection.params || {});
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

    new imagespace.views.SearchView({
        collection: imagespace.getSearchResultCollectionFromQuery(query),
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

        girder.events.trigger('g:navigateTo', imagespace.views.SearchView, {
            collection: imagespace.searches[mode].search(image)
        });

        $('.alert-info').addClass('hidden');
        imagespace.userDataView.render();
    };

    girder.restRequest({
        path: 'imagesearch',
        data: {
            query: 'id:"' + imagespace.urlToSolrId(url) + '"'
        }
    }).done(function (results) {
        var q;
        if (_.size(results) === 0) {
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
            performSearch(_.first(results));
        }
    });
});
