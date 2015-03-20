imagespace.views.SearchView = imagespace.View.extend({
    events: {
    },

    initialize: function (settings) {
        girder.cancelRestRequests('fetch');
        this.results = settings.results;
        this.results.forEach(function (result) {
            var parts = result.id.split('/'),
                file = parts[parts.length - 1];
            result.imageUrl = 'https://s3.amazonaws.com/roxyimages/' + file;
        });
        this.render();
    },

    render: function () {
        this.$el.html(imagespace.templates.search({
            results: this.results,
            showText: true
        }));
        return this;
    }
});

imagespace.router.route('search/:query', 'search', function (query) {
    $('.im-search').val(query);
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
    });
});
