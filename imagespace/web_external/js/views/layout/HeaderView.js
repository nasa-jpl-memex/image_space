imagespace.views.LayoutHeaderView = imagespace.View.extend({
    events: {
    },

    render: function () {
        this.$el.html(imagespace.templates.layoutHeader());

        this.$('a[title]').tooltip({
            placement: 'bottom',
            delay: {show: 300}
        });

        new imagespace.views.LayoutHeaderUserView({
            el: this.$('.h-current-user-wrapper'),
            parentView: this
        }).render();
    }
});
