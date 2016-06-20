girder.events.once('im:appload.after', function () {

    imagespace.views.SearchView.prototype.events['change #im-classification-narrow input'] = function (event) {
        this.collection.params.classifications = [];

        $('#im-classification-narrow input:checked').map(_.bind(function (i, el) {
            this.collection.params.classifications.push($(el).data('key'));
        }, this));

        imagespace.updateQueryParams({
            classifications: this.collection.params.classifications.join(',')
        });

        $('.alert-info').html('Narrowing results <i class="icon-spin5 animate-spin"></i>').removeClass('hidden');
        this.collection.fetch(this.collection.params, true);
    };

    girder.wrap(imagespace.views.SearchView, 'render', function (render) {
        render.call(this);

        this.$('#search-controls .right-search-controls').before(girder.templates.classifications({
            classifications: this.collection.params.classifications
        }));

        return this;
    });

    girder.wrap(imagespace.collections.ImageCollection, 'fetch', function (fetch, params, reset) {
        params = params || {};

        if (_.has(params, 'classifications') && !_.isString(params.classifications)) {
            params.classifications = JSON.stringify(params.classifications);
        }

        fetch.call(this, params, reset);
    });

    girder.wrap(imagespace.collections.ImageCollection, 'initialize', function (initialize) {
        initialize.call(this);

        this.params.classifications = [];

        if (this.filterByQueryString) {
            var qs = imagespace.parseQueryString();

            if (_.has(qs, 'classifications')) {
                this.params.classifications = qs.classifications.split(',');
            }
        }
    });

    girder.wrap(imagespace.views.ImageDetailWidget, 'render', function (render) {
        var _this = this;

        function _render() {
            var ret = render.call(_this);
            return ret;
        }

        // If ads have already been retrieved, or it's an uploaded image with no relevant ads, render
        if (this.image.has('_relevantAds') || this.image instanceof imagespace.models.UploadedImageModel) {
            return _render();
        } else {
            girder.restRequest({
                path: '/weaponssearch/relevant_ads',
                data: {
                    solr_image_id: this.image.get('id')
                }
            }).done(_.bind(function (response) {
                this.image.set('_relevantAdInfo', {
                    totalNumAds: response.numFound,
                    showingNumAds: _.reduce(response.groupedDocs, function (memo, groupedDoc) {
                        return memo + groupedDoc[1].length;
                    }, 0)
                });

                this.image.set('_relevantAds', _.map(response.groupedDocs, function (groupedDoc) {
                    var domain = _.first(groupedDoc),
                        documents = _.last(groupedDoc);

                    return [domain, _.map(documents, function (document) {
                        return {
                            resourcename: _.last(document.id.split('/')),
                            url: document.url
                        };
                    })];
                }));
                return _render();
            }, this));
        }
    });

});
