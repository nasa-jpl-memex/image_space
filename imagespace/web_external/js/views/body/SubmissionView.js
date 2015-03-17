/**
* View for an individual submission.
*/
covalic.views.SubmissionView = covalic.View.extend({
    events: {
        'click .c-restart-error-submission-button': function () {
            // create a new submission with the same properties
            var submission = new covalic.models.SubmissionModel();
            submission.on('c:submissionPosted', function () {
                covalic.router.navigate('submission/' + submission.get('_id'), {trigger: true});
            }, this).postSubmission({
                phaseId: this.submission.get('phaseId'),
                folderId: this.submission.get('folderId'),
                title: this.submission.get('title')
            });
        }
    },

    initialize: function (settings) {
        this.submission = settings.submission;

        if (!this.submission.get('score')) {
            girder.eventStream.on('g:event.job_status', this._statusHandler, this);
            girder.eventStream.on('g:event.progress', this._progressHandler, this);

            if (girder.currentUser && (
                    girder.currentUser.get('_id') === this.submission.get('creatorId') ||
                    girder.currentUser.get('admin'))) {
                this.job = new girder.models.JobModel({
                    _id: this.submission.get('jobId')
                }).on('g:fetched', function () {
                    if (this.job.get('status') === girder.jobs_JobStatus.ERROR) {
                        this._renderProcessingError();
                    } else if (this.job.get('status') === girder.jobs_JobStatus.SUCCESS) {
                        this.submission.once('g:fetched', this.render, this).fetch();
                    }
                }, this).fetch();
            }
        }

        this.phase = new covalic.models.PhaseModel({
            _id: this.submission.get('phaseId')
        }).on('g:fetched', function () {
            this.render();
        }, this).fetch();
    },

    render: function () {
        this.$el.html(covalic.templates.submissionPage({
            submission: this.submission,
            created: girder.formatDate(this.submission.get('created'), girder.DATE_SECOND)
        }));

        var userModel = new girder.models.UserModel();
        userModel.set('_id', this.submission.get('creatorId'));
        this.$('.c-user-portrait').css('background-image', 'url(' +
        userModel.getGravatarUrl(64) + ')');

        if (this.submission.get('score')) {
            new covalic.views.ScoreDetailWidget({
                el: this.$('.c-submission-score-detail-container'),
                submission: this.submission,
                phase: this.phase,
                parentView: this
            }).render();
        }
    },

    _statusHandler: function (progress) {
        var status = window.parseInt(progress.data.status);
        if (progress.data._id === this.job.get('_id') &&
                status === girder.jobs_JobStatus.SUCCESS) {
            this.submission.off().on('g:fetched', function () {
                girder.eventStream.off('g:event.job_status', null, this);
                girder.eventStream.off('g:event.progress', null, this);
                this.render();
            }, this).fetch();
        } else if (status === girder.jobs_JobStatus.ERROR) {
            this.job.fetch();
        }
    },

    _progressHandler: function (progress) {
        if (this.job.get('progress')) {
            var percentText = '0%';

            if (progress._id === this.job.get('progress').notificationId) {
                if (progress.data.state === 'active') {
                    var barClass = [], progressClass = [];
                    if (progress.data.total <= 0) {
                        width = '100%';
                        barClass.push('progress-bar-warning');
                        progressClass.push('progress-striped', 'active');
                    } else if (progress.data.current <= 0) {
                        width = '0';
                        percentText = '0%';
                    } else if (progress.data.current >= progress.data.total) {
                        percentText = width = '100%';
                    } else {
                        var percent = (100 * progress.data.current / progress.data.total);
                            width = Math.round(percent) + '%';
                            percentText = percent.toFixed(1) + '%';
                    }

                    this.$('.c-score-progress-container').html(covalic.templates.scoringProgress({
                        progress: progress,
                        width: width,
                        barClass: barClass.join(' '),
                        progressClass: progressClass.join(' '),
                        percentText: percentText
                    }));
                }
            }
        } else {
            this.job.once('g:fetched', function () {
                if (this.job.get('progress')) {
                    this._progressHandler(progress);
                }
            }, this).fetch();
        }
    },

    // If an error occurred during processing, we'll display error info.
    _renderProcessingError: function () {
        this.$('.c-submission-display-body').html(covalic.templates.submissionError({
            job: this.job,
            adminUser: (girder.currentUser && girder.currentUser.get('admin'))
        }));

        new girder.views.jobs_JobDetailsWidget({
            el: this.$('.c-job-details-container'),
            parentView: this,
            job: this.job
        }).render();
    }
});

covalic.router.route('submission/:id', 'phase_submission', function (id, params) {
    var submission = new covalic.models.SubmissionModel();
    submission.set({
        _id: id
    }).on('g:fetched', function () {
        girder.events.trigger('g:navigateTo', covalic.views.SubmissionView, {
            submission: submission
        });
    }).on('g:error', function () {
        covalic.router.navigate('challenges', {trigger: true});
    }).fetch();
});
