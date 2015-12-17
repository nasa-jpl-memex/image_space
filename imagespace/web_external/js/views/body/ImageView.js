/**
 * This view handles the display of a single image.
 * It can display the image using either a list template, or a grid template
 * as dictated by this.viewMode.
 **/
imagespace.views.ImageView = imagespace.View.extend({
    events: {
        'click .im-add-user-data': function (event) {
            var id = $(event.currentTarget).attr('im-id'),
                image = this.model;
            imagespace.userDataView.addUserImage(image);
        },

        'click .im-details': function (event) {
            var id = $(event.currentTarget).attr('im-id'),
                image = this.model;
            this.imageDetailWidget = new imagespace.views.ImageDetailWidget({
                el: $('#g-dialog-container'),
                image: image,
                parentView: this
            });
            this.imageDetailWidget.render();
        },

        'click .im-find-similar': function (event) {
            var id = $(event.currentTarget).attr('im-id'),
                image = this.model;
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
        }
    },

    initialize: function (settings) {
        this.model = settings.model;
        this.viewMode = settings.viewMode;
    },

    render: function () {
        var args = {
            image: this.model
        };

        if (this.viewMode === 'list') {
            this.$el.html(imagespace.templates.imageResultList(args));
        } else if (this.viewMode === 'grid') {
            this.$el.html(imagespace.templates.imageResultGrid(args));
        }

        return this;
    }
});
