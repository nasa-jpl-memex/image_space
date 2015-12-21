girder.events.once('im:appload.after', function () {
    imagespace.searches['columbia-content'] = {
        search: function (image) {
            var collection = new imagespace.collections.SearchResultCollection(null, {
                altUrl: 'columbia_imagecontentsearch',
                params: {
                    url: image.imageUrl
                }
            });

            return collection;
        },
        niceName: 'Content (Columbia)'
    };
}, this);
