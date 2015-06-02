/**
 * Dialog for selecting a phase by ID.
 */
imagespace.views.ImageDetailWidget = imagespace.View.extend({
    events: {
        'click .im-search-mod': function(event) {
            var query = $(event.currentTarget).attr('im-search');
            this.$el.modal('hide');
            imagespace.router.navigate('search/' + encodeURIComponent(query), {trigger: true});
        },

        'click .im-permalink': function(event) {
            var parts = this.image.id.split('/'),
                file = parts[parts.length - 1];
            if (this.image.id.indexOf('cmuImages') !== -1) {
                file = 'cmuImages/' + file;
            }
            file = '/data/roxyimages/' + file;
            this.$el.modal('hide');
            imagespace.router.navigate('search/' + encodeURIComponent('id:"' + file + '"'), {trigger: true});
        },

        'click .im-similar-images': function(event) {
            this.$('.im-similar-images')
                .addClass('btn-info disabled')
                .removeClass('btn-default')
                .html('<i class="icon-spin5 animate-spin"></i> Processing ...');
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
        }
    },

    initialize: function (settings) {
        console.log(settings.image);
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

    findSimilarImages: function() {
        girder.restRequest({
            path: 'imagesearch',
            data: {
                url: this.image.imageUrl,
                histogram: JSON.stringify(this.image.histogram),
                limit: 100
            }
        }).done(_.bind(function (results) {
            console.log(results);
            this.$el.modal('hide');
            var query = '', count = 0;
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
            imagespace.router.navigate('search/' + encodeURIComponent(query), {trigger: true});
        }, this));
    }
});
