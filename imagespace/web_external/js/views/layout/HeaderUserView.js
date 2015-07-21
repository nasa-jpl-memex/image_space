imagespace.views.LayoutHeaderUserView = imagespace.View.extend({

    events: {
        'click a.g-login': function () {
            girder.events.trigger('g:loginUi');
        },

        'click a.g-register': function () {
            girder.events.trigger('g:registerUi');
        },

        'click a.g-logout': function () {
            girder.restRequest({
                path: 'user/authentication',
                type: 'DELETE'
            }).done(_.bind(function () {
                girder.currentUser = null;
                girder.events.trigger('g:login');
            }, this));
        }
    },

    initialize: function () {
        girder.events.on('g:login', function () {
            this.render();
            if (imagespace.userDataView) {
                imagespace.userDataView.render();
            }
        }, this);
    },

    render: function () {
        this.$el.html(imagespace.templates.layoutHeaderUser({
            user: girder.currentUser
        }));

        if (girder.currentUser) {
            this.$('.h-portrait-wrapper').css(
                'background-image', 'url(' +
                girder.currentUser.getGravatarUrl(36) + ')');
        }
        return this;
    }
});
