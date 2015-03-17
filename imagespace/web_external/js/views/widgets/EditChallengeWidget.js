/**
* This widget is used to create a new challenge or edit an existing one.
*/
covalic.views.EditChallengeWidget = covalic.View.extend({
    events: {
        'submit #c-challenge-edit-form': function (e) {
            e.preventDefault();

            var fields = {
                name: this.$('#c-challenge-name').val(),
                description: this.$('#c-challenge-description').val(),
                instructions: this.$('#c-challenge-instructions').val()
            };

            if (this.model) {
                this.updateChallenge(fields);
            } else {
                this.createChallenge(fields);
            }

            this.$('button.c-save-challenge').addClass('disabled');
            this.$('.g-validation-failed-message').text('');
        }
    },

    initialize: function (settings) {
        this.model = settings.model || null;
    },

    render: function () {
        var view = this;
        var modal = this.$el.html(covalic.templates.editChallengeWidget({
            challenge: this.model
        })).girderModal(this).on('shown.bs.modal', function () {
            view.$('#c-challenge-name').focus();
        }).on('hidden.bs.modal', function () {
            if (view.create) {
                girder.dialogs.handleClose('create');
            } else {
                girder.dialogs.handleClose('edit');
            }
        }).on('ready.girder.modal', function () {
            if (view.model) {
                view.$('#c-challenge-name').val(view.model.get('name'));
                view.$('#c-challenge-description').val(view.model.get('description'));
                view.$('#c-challenge-instructions').val(view.model.get('instructions'));

                view.create = false;
            } else {
                view.create = true;
            }
        });
        modal.trigger($.Event('ready.girder.modal', {relatedTarget: modal}));
        this.$('#c-challenge-name').focus();

        if (view.model) {
            girder.dialogs.handleOpen('edit');
        } else {
            girder.dialogs.handleOpen('create');
        }

        return this;
    },

    createChallenge: function (fields) {
        var challenge = new covalic.models.ChallengeModel();
        challenge.set(fields);
        challenge.on('g:saved', function () {
            this.$el.modal('hide');
            this.trigger('g:saved', challenge);
        }, this).off('g:error').on('g:error', function (err) {
            this.$('.g-validation-failed-message').text(err.responseJSON.message);
            this.$('button.c-save-phase').removeClass('disabled');
            this.$('#c-challenge-' + err.responseJSON.field).focus();
        }, this).save();
    },

    updateChallenge: function (fields) {
        this.model.set(fields);
        this.model.on('g:saved', function () {
            this.$el.modal('hide');
            this.trigger('g:saved', this.model);
        }, this).off('g:error').on('g:error', function (err) {
            this.$('.g-validation-failed-message').text(err.responseJSON.message);
            this.$('button.c-save-challenge').removeClass('disabled');
            this.$('#c-challenge-' + err.responseJSON.field).focus();
        }, this).save();
    }
});
