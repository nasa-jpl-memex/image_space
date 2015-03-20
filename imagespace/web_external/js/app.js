imagespace.App = girder.App.extend({

    render: function() {
        this.$el.html(imagespace.templates.layout());

        new imagespace.views.LayoutHeaderView({
            el: this.$('#c-app-header-container'),
            parentView: this
        }).render();

        return this;
    },

    navigateTo: function (view, settings) {
        console.log(view);
        console.log(settings);

        this.$('.im-nav-li').removeClass('active');

        // this.$('#g-app-body-container').removeClass('c-body-nopad');
        return girder.App.prototype.navigateTo.apply(this, arguments)
    }
});
