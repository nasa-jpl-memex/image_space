girder.events.once('im:appload.after', function () {
    imagespace.searches['pot-similarity'] = {
        search: function (image) {
            var collection = new imagespace.collections.ImageCollection(null, {
                altUrl: 'pot_similarity_search',
                params: {
                    url: image.imageUrl
                }
            });

            return collection;
        },
        niceName: 'Video Similarity (PoT)'
    };

    imagespace.defaultSimilaritySearch = 'pot-similarity';
}, this);
