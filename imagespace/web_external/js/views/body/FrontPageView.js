imagespace.views.FrontPageView = girder.views.FrontPageView.extend({
    events: {
    },

    initialize: function () {
        girder.cancelRestRequests('fetch');
        this.render();
    },

    render: function () {
        this.$el.html(imagespace.templates.frontPage());
        imagespace.headerView.render();

        return this;
    }
});

imagespace.router.route('', 'index', function (query) {
    girder.events.trigger('g:navigateTo', imagespace.views.FrontPageView);
});
