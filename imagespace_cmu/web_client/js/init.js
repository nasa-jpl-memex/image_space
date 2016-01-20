girder.events.once('im:appload.after', function () {
    var cmuSearchResultCollection = function (args, collectionArgs) {
        return _.extend({
            search: function (image) {
                return new imagespace.collections.ImageCollection(null, _.extend({
                    params: {
                        url: _.has(image, 'imageUrl') ? image.imageUrl : image.get('imageUrl')
                    },
                    supportsPagination: false,
                    comparator: function (image) {
                        return -image.get('im_score');
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

    if (imagespace.defaultSimilaritySearch === null) {
        imagespace.defaultSimilaritySearch = 'cmu-full';
    }

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
