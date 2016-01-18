girder.events.once('im:appload.after', function () {
    var smqtkSearchResultCollection = function (args, collectionArgs) {
        return _.extend({
            search: function (image) {
                return new imagespace.collections.ImageCollection(null, _.extend({
                    params: {
                        url: _.has(image, 'imageUrl') ? image.imageUrl : image.get('imageUrl')
                    },
                    supportsPagination: false,
                    comparator: function (image) {
                        return image.get('im_distance');
                    }
                }, collectionArgs || {}));
            }
        }, args);
    };

    imagespace.searches['smqtk-similarity'] = smqtkSearchResultCollection(
        { niceName: 'Similarity (SMQTK)' },
        { altUrl: 'smqtk_similaritysearch' }
    );
}, this);
