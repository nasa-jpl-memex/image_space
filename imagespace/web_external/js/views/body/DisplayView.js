imagespace.views.DisplayView = imagespace.View.extend({
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
            $('.alert-info').html('Finding similar images <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');
            this.$('.btn-lg').addClass('disabled');
            $(event.currentTarget).parent().find('.im-find-similar')
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
        this.resLimit = 30;
        this.imagePathRoot = '/data/roxyimages/';
        // this.imagePathRoot = '/data/xdata/syria/syria_instagram_images/'
        this.results = settings.results;
        this.imageIdMap = {};
        this.results.forEach(_.bind(function (result) {
            result.imageUrl = result.id;
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
    },

    findSimilarImages: function (image) {
        girder.restRequest({
            path: 'imagesearch',
            data: {
                url: image.imageUrl,
                histogram: JSON.stringify(image.histogram || []),
                limit: this.resLimit
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
                file = this.imagePathRoot + file;
                if (count < this.resLimit) {
                    query += 'id:"' + file + '" ';
                    count += 1;
                }
            }, this));
            query += ')';
            imagespace.router.navigate('search/' + encodeURIComponent(query), {trigger: true});

            $('.btn-lg').removeClass('disabled');
            $('.im-find-similar').html('<i class="icon-search"></i>');

            $('.alert-info').addClass('hidden');
            $('.alert-success').text('Search complete.').removeClass('hidden');
            setTimeout(function () {
                $('.alert-success').addClass('hidden')
            }, 5000);

        }, this));
    }

});

imagespace.router.route('display/:content', 'display', function (content) {
    $('.im-search').val(content);
    girder.events.trigger('g:navigateTo', imagespace.views.DisplayView, {
        results: JSON.parse(content)
    });
});
