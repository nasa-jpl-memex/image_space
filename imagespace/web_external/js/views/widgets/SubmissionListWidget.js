/**
 * This widget shows a sorted list of submissions. It is used to render the
 * leaderboard but can be sorted in other ways as well.
 */
covalic.views.SubmissionListWidget = covalic.View.extend({
    initialize: function (settings) {
        this.phase = settings.phase;

        new girder.views.LoadingAnimation({
            el: this.$el,
            parentView: this
        }).render();

        this.collection = new covalic.collections.SubmissionCollection();
        this.collection.on('g:changed', function () {
            this.render();
        }, this).fetch({
            phaseId: this.phase.get('_id'),
            sort: 'overallScore',
            sortdir: girder.SORT_DESC
        });
    },

    render: function () {
        this.$el.html(covalic.templates.leaderboard({
            submissions: this.collection.models,
            start: this.collection.offset - this.collection.length,
            girder: girder
        }));

        new girder.views.PaginateWidget({
            el: this.$('.c-leaderboard-pagination'),
            collection: this.collection,
            parentView: this
        }).render();
    }
});
