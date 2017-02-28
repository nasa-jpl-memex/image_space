girder.events.once('im:appload.after', function () {
    imagespace.searches['tika-similarity'] = {
        search: function (image) {
            var collection = new imagespace.collections.ImageCollection(null, {
                altUrl: 'tika_similarity_search',
                params: {
                    url: image.imageUrl,
                    score: image.attributes.meta_sim_score
                }
            });

            return collection;
        },
        niceName: 'Video Similarity (Tika)'
    };

    imagespace.defaultSimilaritySearch = 'pot-similarity';
}, this);
