imagespace.models.SearchResultModel = girder.Model.extend({
    initialize: function (settings) {
        if (this.has('id')) {
            if (this.get('id').startsWith('http')) {
                this.set('imageUrl', this.get('id'));
            } else {
                this.set('imageUrl', imagespace.solrIdToUrl(this.get('id')));
            }
        }
    }
});
