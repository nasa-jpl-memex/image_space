girder.events.once('im:appload.after', function () {
    var cmuSearchResultCollection = function (args, collectionArgs) {
        return _.extend({
            search: function (image) {
                return new imagespace.collections.SearchResultCollection(null, _.extend({
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

    imagespace.searches['cmu-background'] = cmuSearchResultCollection(
        { niceName: 'Background' },
        { altUrl: 'cmu_imagebackgroundsearch' }
    );

    imagespace.searches['cmu-full'] = cmuSearchResultCollection(
        { niceName: 'Similarity (CMU)' },
        { altUrl: 'cmu_fullimagesearch' }
    );

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
