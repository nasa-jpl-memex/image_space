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

imagespace.router.route('', 'index', function (query) {
    $('.im-search').val('*');
    girder.events.trigger('g:navigateTo', imagespace.views.FrontPageView);
});
