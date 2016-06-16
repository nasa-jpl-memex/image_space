girder.events.once('im:appload.after', function () {

    girder.wrap(imagespace.views.SearchView, 'render', function (render) {
        render.call(this);

        this.$('#search-controls .im-view-mode').before(girder.templates.classifications({
            classifications: this.collection.params.classifications
        }));

        return this;
    });
});
