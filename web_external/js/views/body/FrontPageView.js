imagespace.views.FrontPageView = girder.views.FrontPageView.extend({
    events: {
    },

    initialize: function () {
        $('.im-search').val('*');
        girder.cancelRestRequests('fetch');
        this.render();
    },

    render: function () {
        this.$el.html(imagespace.templates.frontPage());

        return this;
    }
});

imagespace.router.route('', 'index', function () {
    girder.events.trigger('g:navigateTo', imagespace.views.FrontPageView);
});
