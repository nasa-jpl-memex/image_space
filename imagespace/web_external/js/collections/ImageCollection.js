imagespace.collections.ImageCollection = girder.Collection.extend({
    altUrl: 'imagesearch',
    pageLimit: 20,
    supportsPagination: true,
    model: imagespace.models.ImageModel,
    filterByQueryString: true,

    initialize: function (models, options) {
        _.extend(this, options);
        Backbone.Collection.prototype.initialize.apply(this, [models, options]);
        this.params = _.extend({
            fq: 'mainType:image'
        }, this.params || {});
        this.params.classifications = [];

        // Store the ids explicitly mentioned in the query, in order
        if (_.has(this, 'params') && _.has(this.params, 'query')) {
            this.orderedIds = _.filter(_.map(this.params.query.split(' '), function (s) {
                var m = s.match(/id:"(.*)"/);

                if (m) {
                    return m[1];
                } else {
                    return false;
                }
            }), _.identity);
        }

        if (this.filterByQueryString) {
            // Filter collection based on query string
            var qs = imagespace.parseQueryString();

            if (_.has(qs, 'page')) {
                this.offset = (qs.page - 1) * this.pageLimit;
            }

            if (_.has(qs, 'classifications')) {
                this.params.classifications = qs.classifications;
            }
        }
    },

    /**
     * This takes a model and determines if it was explicitly mentioned in the query
     * and if so, returns that index as the order it should be in the collection.
     * Otherwise, it just returns the length of the collection so the remaining
     * models will be ordered the same as they were retrieved.
     **/
    comparator: function (model) {
        if (_.has(this, 'orderedIds')) {
            var explicitlyOrdered = _.indexOf(this.orderedIds, model.get('id'));

            if (explicitlyOrdered !== -1) {
                return explicitlyOrdered;
            }
        }

        return this.length;
    },

    fetch: function (params, reset) {
        if (this.resourceName === null && this.altUrl === null) {
            alert('Error: You must set a resourceName or altUrl on your collection.');
            return;
        }

        if (reset) {
            this.offset = 0;
        } else {
            this.params = params || {};
        }

        if (_.has(this.params, 'classifications') && !_.isString(this.params.classifications)) {
            this.params.classifications = JSON.stringify(this.params.classifications);
        }

        var xhr = girder.restRequest({
            path: this.altUrl || this.resourceName,
            data: _.extend({
                limit: this.pageLimit + 1,
                offset: this.offset,
                sort: this.sortField,
                sortdir: this.sortDir
            }, this.params)
        }).done(_.bind(function (list) {
            list = imagespace.processResponse(list);
            this.numFound = list.numFound;
            list = list.docs;

            if (list.length > this.pageLimit) {
                // This means we have more pages to display still. Pop off
                // the extra that we fetched.
                list.pop();
                this._hasMorePages = true;
            } else {
                this._hasMorePages = false;
            }

            this.offset += list.length;

            if (list.length > 0 || reset) {
                if (this.append && !reset) {
                    this.add(list);
                } else {
                    this.reset(list);
                }
            }

            this.trigger('g:changed');
        }, this));
        xhr.girder = {fetch: true};
    }
});
