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

        'mouseenter .im-attribute': function (event) {
            $(event.target).closest('dd').find('.im-search-operations').removeClass('hidden');
        },

        'mouseleave .im-attribute': function (event) {
            $(event.target).closest('dd').find('.im-search-operations').addClass('hidden');
        }
    },

    initialize: function (settings) {
        this.image = settings.image || null;
        this.title = settings.title || 'Image details';
    },

    render: function () {
        var modal = this.$el.html(imagespace.templates.imageDetailWidget({
            title: this.title,
            image: this.image,
            query: $('.im-search').val(),
            stolenCameraPrefix: imagespace.stolenCameraPrefix,
            searches: imagespace.getApplicableSearches(this.image)
        })).girderModal(this).on('shown.bs.modal', function () {
            if ($('.modal-body img').outerWidth() > $('.modal-dialog').outerWidth()) {
                // 20 is the padding of .modal-body and 30 is the margin of .modal-dialog
                $('.modal-dialog').css('width', ($('.modal-body img').outerWidth() + 20 + 30) + 'px');
            }
        });

        modal.trigger($.Event('ready.girder.modal', {relatedTarget: modal}));

        return this;
    }
});
