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
            imagespace.router.navigate('search/' + encodeURIComponent(this.image.imageUrl) + '/content', {trigger: true});
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
        },

        'mouseenter .im-attribute': function (event) {
            $(event.target).closest('dd').find('.im-search-operations').removeClass('hidden');
        },

        'mouseleave .im-attribute': function (event) {
            $(event.target).closest('dd').find('.im-search-operations').addClass('hidden');
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
    }
});
