covalic.models.SubmissionModel = girder.Model.extend({
    resourceName: 'covalic_submission',

    postSubmission: function (opts) {
        girder.restRequest({
            path: this.resourceName,
            type: 'POST',
            data: {
                folderId: opts.folderId,
                phaseId: opts.phaseId,
                title: opts.title
            }
        }).done(_.bind(function (resp) {
            this.set(resp);
            this.trigger('c:submissionPosted', resp);
        }, this)).error(_.bind(function (err) {
            this.trigger('c:error', err);
        }, this));
    }
});
