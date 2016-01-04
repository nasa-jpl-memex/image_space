girder.events.once('im:appload.after', function () {
    var smqtkSearchResultCollection = function (args, collectionArgs) {
        return _.extend({
            search: function (image) {
                return new imagespace.collections.ImageCollection(null, _.extend({
                    params: {
                        url: image.imageUrl
                    },
                    supportsPagination: false,
                    comparator: function (image) {
                        return -image.get('score');
                    }
                }, collectionArgs || {}));
            }
        }, args);
    };

    imagespace.searches['smqtk-similarity'] = smqtkSearchResultCollection(
        { niceName: 'SmqtkSimilarity' },
        { altUrl: 'smqtk_similaritysearch' }
    );    
}, this);
