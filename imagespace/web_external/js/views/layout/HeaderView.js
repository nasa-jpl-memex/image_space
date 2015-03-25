imagespace.views.LayoutHeaderView = imagespace.View.extend({
    events: {
        'click .im-nav-link': function (event) {
            var link = $(event.currentTarget);
            console.log('click');

            imagespace.router.navigate(link.attr('im-target'), {trigger: true});

            // Must call this after calling navigateTo, since that
            // deactivates all global nav links.
            link.addClass('active');
        },

        'keypress .im-search': function (event) {
            if (event.which === 13) {
                var query = encodeURIComponent($(event.currentTarget).val());
                imagespace.router.navigate('search/' + query, {trigger: true});
            }
        },
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
    },

});
