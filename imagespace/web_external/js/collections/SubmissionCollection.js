covalic.collections.SubmissionCollection = girder.Collection.extend({
    resourceName: 'covalic_submission',
    model: covalic.models.SubmissionModel,

    pageLimit: 100
});
