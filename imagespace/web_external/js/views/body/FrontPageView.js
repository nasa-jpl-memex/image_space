imagespace.views.FrontPageView = girder.views.FrontPageView.extend({
    initialize: function () {
        girder.cancelRestRequests('fetch');
        this.render();
    },

    render: function () {
        this.$el.html(imagespace.templates.frontPage());

        var searchBar = new imagespace.views.SearchBarView({
            el: this.$('#search-bar'),
            parentView: this,
            dropzone: girder.currentUser,
            advancedSearch: true,
            frontPage: true
        }).render();

        // Remove search bar from header on front page
        // This is a hack, because at the time of layout instantiation I can't obtain
        // the route from Backbone. The header search bar should never be rendered (on the front page)
        // in the first place.
        $('.im-nav').remove();

        $('#search-bar input.im-search').focus();

        return this;
    }
});

imagespace.router.route('', 'index', function (query) {
    girder.events.trigger('g:navigateTo', imagespace.views.FrontPageView);
});
