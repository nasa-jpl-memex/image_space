imagespace.collections.SearchResultCollection = girder.Collection.extend({
    pageLimit: 20,
    altUrl: 'imagesearch',

    model: imagespace.models.SearchResultModel,

    initialize: function (models, options) {
        _.extend(this, options);
        Backbone.Collection.prototype.initialize.apply(this, [models, options]);
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
