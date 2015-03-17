covalic.views.ChallengePhasesView = covalic.View.extend({
    events: {
        'click a.c-phase-link': function (event) {
            var cid = $(event.currentTarget).attr('c-phase-cid');
            covalic.router.navigate('phase/' + this.collection.get(cid).id, {trigger: true});
        }
    },

    initialize: function (settings) {
        girder.cancelRestRequests('fetch');
        this.collection = new covalic.collections.ChallengePhaseCollection();
        this.collection.on('g:changed', function () {
            this.render();
        }, this).fetch({
            challengeId: settings.challenge.get('_id')
        });
    },

    render: function () {
        this.$el.html(covalic.templates.challengePhasesPage({
            phases: this.collection.models
        }));

        return this;
    }
});
