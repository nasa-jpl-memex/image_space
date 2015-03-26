/**
 * Dialog for showing instructions.
 */
imagespace.views.InstructionsWidget = imagespace.View.extend({
    events: {
    },

    initialize: function (settings) {
    },

    render: function () {
        var modal = this.$el.html(imagespace.templates.instructionsWidget({
        })).girderModal(this).on('shown.bs.modal', _.bind(function () {
        }, this));

        modal.trigger($.Event('ready.girder.modal', {relatedTarget: modal}));
        return this;
    }

});
