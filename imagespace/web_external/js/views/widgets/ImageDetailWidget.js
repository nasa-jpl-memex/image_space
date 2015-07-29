/**
 * Dialog for selecting a phase by ID.
 */
imagespace.views.ImageDetailWidget = imagespace.View.extend({
    events: {
        'click .im-search-mod': function (event) {
            var query = $(event.currentTarget).attr('im-search');
            this.$el.modal('hide');
            imagespace.router.navigate('search/' + encodeURIComponent(query), {trigger: true});
        },

        'click .im-similar-images': function (event) {
            this.$('.im-similar-images')
                .addClass('btn-info disabled')
                .removeClass('btn-default')
                .html('Finding similar images <i class="icon-spin5 animate-spin"></i>');
            if (this.image.histogram) {
                this.findSimilarImages();
            } else {
                girder.restRequest({
                    path: 'imagefeatures',
                    data: {
                        url: this.image.imageUrl
                    },
                    method: 'POST'
                }).done(_.bind(function (features) {
                    this.image.histogram = features.histogram;
                    this.findSimilarImages();
                }, this));
            }
        },

        'click .im-similar-background-images': function (event) {
            this.$('.im-similar-background-images')
                .addClass('btn-info disabled')
                .removeClass('btn-default')
                .html('Finding images with similar background <i class="icon-spin5 animate-spin"></i>');
            girder.restRequest({
                path: 'imagebackgroundsearch',
                data: {
                    url: this.image.imageUrl
                }
            }).done(_.bind(function (results) {
                console.log(results);
                imagespace.router.navigate('display/' + encodeURIComponent(JSON.stringify(results)), {trigger: true});
            }, this));
        },

        'click .im-similar-domain-dynamics-images': function (event) {
            this.$('.im-similar-domain-dynamics-images')
                .addClass('btn-info disabled')
                .removeClass('btn-default')
                .html('Finding images with similar domain dynamics <i class="icon-spin5 animate-spin"></i>');
            girder.restRequest({
                path: 'imagedomaindynamicssearch',
                data: {
                    url: this.image.imageUrl
                }
            }).done(_.bind(function (results) {
                console.log(results);
                imagespace.router.navigate('search/' + encodeURIComponent(JSON.stringify(results)), {trigger: true});
            }, this));
        }
    },

    initialize: function (settings) {
        this.resLimit = 30;
        this.imagePathRoot = '/data/roxyimages/';
        // this.imagePathRoot = '/data/xdata/syria/syria_instagram_images/'
        this.image = settings.image || null;
        this.title = settings.title || 'Image details';
    },

    render: function () {
        var modal = this.$el.html(imagespace.templates.imageDetailWidget({
            title: this.title,
            image: this.image,
            query: $('.im-search').val(),
            stolenCameraPrefix: imagespace.stolenCameraPrefix
        })).girderModal(this).on('shown.bs.modal', function () {
        });

        modal.trigger($.Event('ready.girder.modal', {relatedTarget: modal}));

        return this;
    },

    findSimilarImages: function () {
        girder.restRequest({
            path: 'imagesearch',
            data: {
                url: this.image.imageUrl,
                histogram: JSON.stringify(this.image.histogram || []),
                limit: this.resLimit
            }
        }).done(_.bind(function (results) {
            console.log(results);
            this.$el.modal('hide');
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
        }, this));
    }
});
