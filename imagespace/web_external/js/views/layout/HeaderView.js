covalic.views.LayoutHeaderView = covalic.View.extend({
    events: {
    },

    render: function () {
        this.$el.html(covalic.templates.layoutHeader());

        this.$('a[title]').tooltip({
            placement: 'bottom',
            delay: {show: 300}
        });

        new covalic.views.LayoutHeaderUserView({
            el: this.$('.c-current-user-wrapper'),
            parentView: this
        }).render();
    }
});
