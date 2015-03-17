covalic.views.PhaseView = covalic.View.extend({

    events: {
        'click #c-join-phase': function (event) {
            if (!girder.currentUser) {
                girder.events.trigger('g:loginUi');
            } else {
                var path = 'challenge_phase/' + this.model.get('_id') + '/participant';
                var type = 'POST';
                girder.restRequest({
                    path: path,
                    type: type,
                    error: null // TODO what?
                }).done(_.bind(function (resp) {
                    var participantGroupId = this.model.get('participantGroupId');
                    girder.currentUser.addToGroup(participantGroupId);
                    this.trigger('c:joinPhase');
                }, this));
            }
        },

        'click a.c-edit-phase': function () {
            if (!this.editPhaseWidget) {
                this.editPhaseWidget = new covalic.views.EditPhaseWidget({
                    el: $('#g-dialog-container'),
                    model: this.model,
                    parentView: this
                }).on('g:saved', function () {
                    this.render();
                }, this);
            }
            this.editPhaseWidget.render();
        },

        'click .c-phase-access-control': function () {
            if (!this.accessWidget) {
                this.accessWidget = new girder.views.AccessWidget({
                    el: $('#g-dialog-container'),
                    model: this.model,
                    modelType: 'challenge_phase',
                    parentView: this
                }).on('g:saved', function () {
                    this.render();
                }, this);
            } else {
                this.accessWidget.render();
            }
        },

        'click .c-delete-phase': function () {
            girder.confirm({
                text: 'Are you sure you want to delete the phase <b>' +
                      this.model.escape('name') + '</b>?',
                yesText: 'Delete',
                escapedHtml: true,
                confirmCallback: _.bind(function () {
                    this.model.destroy({
                        progress: true
                    }).on('g:deleted', function () {
                        girder.events.trigger('g:alert', {
                            icon: 'ok',
                            text: 'Phase deleted.',
                            type: 'success',
                            timeout: 4000
                        });
                        covalic.router.navigate(
                            'challenge/' + this.model.get('challengeId'), {
                                trigger: true
                        });
                    }, this);
                }, this)
            });
        }
    },

    initialize: function (settings) {
        this.on('c:joinPhase', this.render, this);
        girder.cancelRestRequests('fetch');
        if (settings.phase) {
            this.model = settings.phase;

            if (this.challenge) {
                this.render();
            } else {
                this.challenge = new covalic.models.ChallengeModel();
                this.challenge.set({
                    _id: this.model.get('challengeId')
                }).on('g:fetched', function () {
                    this.render();
                }, this).fetch();
            }
        } else if (settings.id) {
            this.model = new girder.models.PhaseModel();
            this.model.set('_id', settings.id);

            this.model.on('g:fetched', function() {
                this.render();
            }, this).fetch();
        }

    },

    isUserInChallenge: function () {
        if (!girder.currentUser) {
            return false;
        }
        var participantGroupId = this.model.get('participantGroupId');
        var userGroupIds = girder.currentUser.attributes.groups;
        return _.contains(userGroupIds, participantGroupId);
    },

    render: function () {
        this.$el.html(covalic.templates.phasePage({
            phase: this.model,
            girder: girder,
            userInChallenge: this.isUserInChallenge(),
            challenge: this.challenge
        }));

        if (this.model.get('instructions')) {
            girder.renderMarkdown(
                this.model.get('instructions'), this.$('.c-phase-instructions'));
        }

        new covalic.views.LeaderboardWidget({
            phase: this.model,
            el: this.$('.c-leaderboard-widget-container'),
            parentView: this
        }).render();

        this.$('button[title]').tooltip({
            placement: 'left'
        });

        return this;
    }
});

covalic.router.route('phase/:id', 'phase', function(id, params) {
    // Fetch the phase by id, then render the view.
    var phase = new covalic.models.PhaseModel();
    phase.set({
        _id: id
    }).on('g:fetched', function () {
        girder.events.trigger('g:navigateTo', covalic.views.PhaseView, {
            phase: phase
        });
    }, this).on('g:error', function () {
        covalic.router.navigate('challenges', {trigger: true});
    }, this).fetch();
});
