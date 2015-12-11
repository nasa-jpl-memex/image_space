imagespace.views.LayoutHeaderView = imagespace.View.extend({
    render: function (settings) {
        this.image = settings ? settings.image : undefined;

        this.$el.html(imagespace.templates.layoutHeader(settings));

        var searchBar = new imagespace.views.SearchBarView(_.extend({
            el: this.$('#header-search-bar'),
            dropzone: girder.currentUser, // Only allow dropzone if the user is logged in
            parentView: this
        }, settings)).render();

        this.$('a[title]').tooltip({
            placement: 'bottom',
            delay: {show: 300}
        });

        new imagespace.views.LayoutHeaderUserView({
            el: this.$('.h-current-user-wrapper'),
            parentView: this
        }).render();

        return this;
    }
});
