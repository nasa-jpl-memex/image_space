girder.events.once('im:appload.after', function () {
    imagespace.searches['flann-content'] = {
        search: function (image) {
            var collection = new imagespace.collections.SearchResultCollection(null, {
                altUrl: 'flann_imagecontentsearch',
                params: {
                    url: image.imageUrl
                }
            });

            return collection;
        },
        niceName: 'Content (Flann)'
    };

    imagespace.defaultSimilaritySearch = 'flann-content';
}, this);
