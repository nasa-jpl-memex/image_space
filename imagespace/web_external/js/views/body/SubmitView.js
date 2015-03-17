/**
 * Page where users upload a submission.
 */
covalic.views.SubmitView = covalic.View.extend({
    events: {
        'input .c-submission-title-input': function () {
            this.title = this.$('.c-submission-title-input').val().trim();
            this.$('.c-submission-title-error').empty();
            this.uploadWidget.setUploadEnabled(!!this.title && this.filesCorrect);
        }
    },

    initialize: function (settings) {
        this.phase = settings.phase;
        this.phase.fetchGroundtruthItems();
        this.filesCorrect = false;
        this.render();
    },

    render: function () {
        this.$el.html(covalic.templates.submitPage({
            phase: this.phase,
            maxTitleLength: 80
        }));

        this.uploadWidget = new girder.views.UploadWidget({
            el: this.$('.c-submit-upload-widget'),
            modal: false,
            noParent: true,
            title: null,
            overrideStart: true,
            parentView: this
        }).render();

        this.$('input.c-submission-title-input').focus();

        this.listenTo(this.uploadWidget, 'g:filesChanged', this.filesSelected);
        this.listenTo(this.uploadWidget, 'g:uploadStarted', this.uploadStarted);
        this.listenTo(this.uploadWidget, 'g:uploadFinished', this.uploadFinished);
    },

    /**
     * Called when the user selects or drops files to be uploaded.
     */
    filesSelected: function (files) {
        var transformName = function (f) {
            var dotPos = _.indexOf(f.name, '.');
            if (dotPos === -1) {
                return f.name;
            } else {
                return f.name.substr(0, dotPos);
            }
        };

        var matchInfo = this._matchInput(
            _.map(files, transformName),
            _.map(this.phase.get('groundtruthItems'), transformName)
        );

        matchInfo.ok = !(matchInfo.unmatchedGroundtruths.length ||
                         matchInfo.unmatchedInputs.length);

        var titleOk = this.$('input.c-submission-title-input').val().trim().length > 0;

        if (!titleOk) {
            this.$('input.c-submission-title').focus();
            this.$('.c-submission-title-error').text(
                'Please enter a title for your submission.');
        }

        this.uploadWidget.setUploadEnabled(matchInfo.ok && titleOk);

        this.$('.c-submission-mismatch-container').html(covalic.templates.mismatchedInputs({
            matchInfo: matchInfo
        }));

        this.filesCorrect = matchInfo.ok;
    },

    _matchInput: function (inputs, groundtruths) {
        return {
            unmatchedGroundtruths: _.difference(groundtruths, inputs),
            unmatchedInputs: _.difference(inputs, groundtruths),
            matched: _.intersection(inputs, groundtruths)
        };
    },

    /**
     * When "start upload" is clicked, we want to make a folder in the user's
     * personal space for the submission contents, so we do that and then proceed
     * uploading into it.
     */
    uploadStarted: function () {
        this.folder = new girder.models.FolderModel({
            name: 'submission_' + this.phase.get('_id') + '_' + Date.now(),
            parentType: 'user',
            parentId: girder.currentUser.get('_id'),
            description: 'Challenge submission'
        });

        this.folder.on('g:saved', function () {
            this.uploadWidget.parentType = 'folder';
            this.uploadWidget.parent = this.folder;
            this.uploadWidget.uploadNextFile();
        }, this).on('g:error', function (err) {
            girder.events.trigger('g:alert', {
                icon: 'cancel',
                text: 'Could not create submission folder.',
                type: 'error',
                timeout: 4000
            });
        }, this).save();
    },

    uploadFinished: function () {
        var submission = new covalic.models.SubmissionModel();
        submission.on('c:submissionPosted', function () {
            covalic.router.navigate('submission/' + submission.get('_id'), {trigger: true});
        }, this).postSubmission({
            phaseId: this.phase.get('_id'),
            folderId: this.folder.get('_id'),
            title: this.title
        });
    }
});

covalic.router.route('phase/:id/submit', 'phase_submit', function (id, params) {
    var phase = new covalic.models.PhaseModel();
    phase.set({
        _id: id
    }).on('g:fetched', function () {
        girder.events.trigger('g:navigateTo', covalic.views.SubmitView, {
            phase: phase
        });
    }, this).on('g:error', function () {
        covalic.router.navigate('challenges', {trigger: true});
    }, this).fetch();
});
