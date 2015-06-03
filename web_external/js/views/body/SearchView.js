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
            this.$('.im-find-similar')
                .addClass('btn-info disabled')
                .removeClass('btn-default')
                .html('<i class="icon-spin5 animate-spin"></i>');
            if (image.histogram) {
                this.findSimilarImages(image);
            } else {
                girder.restRequest({
                    path: 'imagefeatures',
                    data: {
                        url: image.imageUrl
                    },
                    method: 'POST'
                }).done(_.bind(function (features) {
                    image.histogram = features.histogram;
                    this.findSimilarImages(image);
                }, this));
            }
        },

        'mouseover .im-image-area': function (event) {
            $(event.currentTarget).find('.im-caption-content').removeClass('hidden');
        },

        'mouseout .im-image-area': function (event) {
            $(event.currentTarget).find('.im-caption-content').addClass('hidden');
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
            result.imageUrl = imagespace.prefix + file;
            this.imageIdMap[result.id] = result;
        }, this));

        // Place in order if ids are explicit
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

        this.render();
    },

    render: function () {
        this.$el.html(imagespace.templates.search({
            results: this.results,
            showText: true
        }));
        return this;
    },

    findSimilarImages: function(image) {
        girder.restRequest({
            path: 'imagesearch',
            data: {
                url: image.imageUrl,
                histogram: JSON.stringify(image.histogram || []),
                limit: 100
            }
        }).done(_.bind(function (results) {
            var query = '(', count = 0;
            results.forEach(_.bind(function (result, index) {
                 var parts = result.id.split('/'),
                     file = parts[parts.length - 1];
                 if (file.length < 30) {
                     return;
                 }
                 if (result.id.indexOf('cmuImages') !== -1) {
                     file = 'cmuImages/' + file;
                 }
                 file = '/data/roxyimages/' + file;
                 if (count < 100) {
                    query += 'id:"' + file + '" ';
                    count += 1;
                }
            }, this));
            query += ')';
            imagespace.router.navigate('search/' + encodeURIComponent(query), {trigger: true});
        }, this));
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
