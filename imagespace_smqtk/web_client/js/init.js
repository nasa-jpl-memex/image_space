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
                        return image.get('smqtk_distance');
                    }
                }, collectionArgs || {}));
            }
        }, args);
    };

    imagespace.searches['smqtk-similarity'] = smqtkSearchResultCollection(
        { niceName: 'Similarity (SMQTK)',
          tooltip: 'Launch Kitware\'s SMQTK image similarity search'
        },
        { altUrl: 'smqtk_similaritysearch' }
    );

    /**
     * Render the search view, and then for smqtk-similarity searches render
     * the nearDuplicates template in the control bar.
     **/
    girder.wrap(imagespace.views.SearchView, 'render', function (render) {
        render.call(this);

        if (this.mode === 'smqtk-similarity') {
            this.$('#im-classification-narrow').after(girder.templates.nearDuplicates({
                near_duplicates: (_.has(this.collection.params, 'near_duplicates') &&
                                  this.collection.params.near_duplicates === 1)
            }));
        }
    });

    /**
     * Update the collection when the near duplicates checkbox is acted on.
     **/
    imagespace.views.SearchView.prototype.events['change #smqtk-near-duplicates input'] = function (event) {
        this.collection.params.near_duplicates = Number(event.currentTarget.checked);

        imagespace.updateQueryParams({
            near_duplicates: this.collection.params.near_duplicates
        });

        $('.alert-info').html('Narrowing results <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');
        this.collection.fetch(this.collection.params, true);
    };

    /**
     * Handle collection initialize so it accounts for the new query parameter
     * we're adding (near_duplicates).
     **/
    girder.wrap(imagespace.collections.ImageCollection, 'initialize', function (initialize, models, options) {
        initialize.call(this, models, options);

        if (this.filterByQueryString) {
            var qs = imagespace.parseQueryString();

            if (_.has(qs, 'near_duplicates')) {
                this.params.near_duplicates = Number(qs.near_duplicates);
            }
        }
    });
}, this);
