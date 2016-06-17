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
});
