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

        'click .im-search-image': function (event) {
            this.imageDetailWidget = new imagespace.views.ImageDetailWidget({
                el: $('#g-dialog-container'),
                image: this.image,
                parentView: this
            });
            this.imageDetailWidget.render();
        },

        'keypress .im-search': function (event) {
            var q = $(event.currentTarget).val();
            if (event.which === 13) {
                var query = encodeURIComponent(q);
                imagespace.router.navigate('search/' + query, {trigger: true});
            }
        },

        'input .im-search': function (event) {
            var q = $(event.currentTarget).val();
            if (q.length > 0) {
                $('.im-search-button').removeAttr('disabled');
            } else {
                $('.im-search-button').attr('disabled', 'disabled');
            }
        },

        'click .im-search-button': function (event) {
            var query = encodeURIComponent($('.im-search').val());
            imagespace.router.navigate('search/' + query, {trigger: true});
        }
    },

    render: function (settings) {
        this.image = settings ? settings.image : undefined;

        this.$el.html(imagespace.templates.layoutHeader(settings));

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
