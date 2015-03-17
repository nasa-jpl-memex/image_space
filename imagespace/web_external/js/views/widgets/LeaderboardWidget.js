covalic.views.LeaderboardWidget = covalic.View.extend({
    initialize: function (settings) {
        this.phase = settings.phase;
    },

    render: function () {
        this.$el.html(covalic.templates.leaderboardWidget());
        new covalic.views.SubmissionListWidget({
            el: this.$('.c-leaderboard-container'),
            phase: this.phase,
            parentView: this
        }).render();
    }
});
