imagespace.models.UploadedImageModel = imagespace.models.ImageModel.extend({
    initialize: function () {
        this._setApplicableSearches();
    }
});
