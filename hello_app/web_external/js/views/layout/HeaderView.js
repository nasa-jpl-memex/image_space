hello_app.views.LayoutHeaderView = hello_app.View.extend({
    events: {
    },

    render: function () {
        this.$el.html(hello_app.templates.layoutHeader());

        this.$('a[title]').tooltip({
            placement: 'bottom',
            delay: {show: 300}
        });

        new hello_app.views.LayoutHeaderUserView({
            el: this.$('.h-current-user-wrapper'),
            parentView: this
        }).render();
    }
});
