imagespace.views.SearchView = imagespace.View.extend({
    events: {
        'click .im-details': function (event) {
            var id = $(event.currentTarget).attr('im-id'),
                image = this.imageIdMap[id];
            this.imageDetailWidget = new imagespace.views.ImageDetailWidget({
                el: $('#g-dialog-container'),
                image: image,
                parentView: this
            });
            this.imageDetailWidget.render();
        }
    },

    initialize: function (settings) {
        girder.cancelRestRequests('fetch');
        this.results = settings.results;
        this.imageIdMap = {};
        this.results.forEach(_.bind(function (result) {
            var parts = result.id.split('/'),
                file = parts[parts.length - 1];
            if (result.id.indexOf('cmuImages') !== -1) {
                file = 'cmuImages/' + file;
            }
            result.imageUrl = 'https://s3.amazonaws.com/roxyimages/' + file;
            this.imageIdMap[result.id] = result;
        }, this));
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
