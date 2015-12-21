girder.events.once('im:appload.after', function () {
    imagespace.searches['cmu-background'] = {
        search: function (image) {
            var collection = new imagespace.collections.SearchResultCollection(null, {
                altUrl: 'cmu_imagebackgroundsearch',
                params: {
                    url: image.imageUrl
                }
            });

            return collection;
        },
        niceName: 'Background'
    };

    imagespace.solrIdToUrl = function (id) {
        var re = new RegExp("^" + imagespace.solrPrefix),
            file = id.replace(re, "");

        if (id.indexOf('cmuImages') !== -1) {
            file = 'cmuImages/' + file;
        }

        return imagespace.prefix + file;
    };

    imagespace.urlToSolrId = function (url) {
        var re = new RegExp("^" + imagespace.prefix),
            file = url.replace(re, "");

        if (file.length < 30) {
            return;
        }

        if (url.indexOf('cmuImages') !== -1) {
            file = 'cmuImages/' + file;
        }

        return imagespace.solrPrefix + file;
    };
}, this);
