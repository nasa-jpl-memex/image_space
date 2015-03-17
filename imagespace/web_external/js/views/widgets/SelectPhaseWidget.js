/**
 * Dialog for selecting a phase by ID.
 */
covalic.views.SelectPhaseWidget = covalic.View.extend({
    events: {
        'submit #c-phase-select-form': function (e) {
            e.preventDefault();

            this.$('.g-validation-failed-message').empty();

            var id = this.$('#c-phase-id').val(),
                phase = new covalic.models.PhaseModel({_id: id});

            phase.on('g:fetched', function () {
                this.$el.modal('hide');
                this.trigger('c:phaseSelected', phase);
            }, this).on('g:error', function (resp) {
                this.$('.g-validation-failed-message').text(resp.responseJSON.message);
            }, this).fetch();
        }
    },

    initialize: function (settings) {
        this.phase = settings.phase || null;
        this.title = settings.title || 'Select phase';
    },

    render: function () {
        var view = this;
        var modal = this.$el.html(covalic.templates.selectPhase({
            title: this.title
        })).girderModal(this).on('shown.bs.modal', function () {
            view.$('#c-phase-id').focus();
        });

        modal.trigger($.Event('ready.girder.modal', {relatedTarget: modal}));
        this.$('#c-phase-id').focus();

        return this;
    }
});
