/**
 * This view handles the display of a single image in the sidebar, otherwise
 * known as an image that has been uploaded by the user. These images are also
 * backed by the SearchResultModel (though they differ slightly).
 * The main difference between the ImageView and the UploadedImageView is
 * the ability to remove a file.
 **/
imagespace.views.UploadedImageView = imagespace.views.ImageView.extend({
    events: {
        'click .im-remove': function (event) {
            var id = $(event.currentTarget).attr('im-id'),
                image = this.model,
                item = new girder.models.ItemModel({
                    _id: image.get('item_id')
                });

            if (image.has('item_id')) {
                item.once('g:deleted', function () {
                    this.destroy();

                    // If this is the last item being deleted, hide the sidebar
                    if (_.size(imagespace.userData.images) === 1) {
                        $('#sidebar-wrapper').hide();
                        $('#wrapper').addClass('toggled');
                    }
                }, this).destroy();
            }
        }
    },

    initialize: function (settings) {
        this.model = settings.model;
        _.extend(this.events, imagespace.views.ImageView.prototype.events);
    },

    render: function () {
        this.$el.html(imagespace.templates.imageResultSidebar({
            image: this.model,
            defaultSimilaritySearch: imagespace.defaultSimilaritySearch
        }));

        return this;
    }
});
