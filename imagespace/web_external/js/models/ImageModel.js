imagespace.models.ImageModel = girder.Model.extend({
    initialize: function (settings) {
        if (this.has('id')) {
            if (this.get('id').startsWith('http')) {
                this.set('imageUrl', this.get('id'));
            } else {
                this.set('imageUrl', imagespace.solrIdToUrl(this.get('id')));
            }
        }

        // Determine which searches can be applied to this image when it's
        // first initialized
        this._setApplicableSearches();
    },

    _setApplicableSearches: function () {
        this.set('_applicableSearches', imagespace.getApplicableSearches(this));
    }
});
