girder.events.once('im:appload.after', function () {
    imagespace.searches['georgetown-dynamics'] = {
        search: function (image) {
            var collection = new imagespace.collections.ImageCollection(null, {
                altUrl: 'georgetown_imagedomaindynamicssearch',
                params: {
                    url: image.imageUrl
                }
            });

            return collection;
        },
        niceName: 'Dynamics'
    };
}, this);
