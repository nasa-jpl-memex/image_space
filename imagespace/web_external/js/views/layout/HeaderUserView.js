imagespace.views.LayoutHeaderUserView = imagespace.View.extend({

    events: {
        'click a.g-login': function () {
            girder.events.trigger('g:loginUi');
        },

        'click a.g-register': function () {
            girder.events.trigger('g:registerUi');
        },

        'click a.g-logout': girder.logout
    },

    redisplay: function () {
        this.render();

        if (imagespace.userDataView) {
            imagespace.userDataView.updateUserData();
        }
    },

    initialize: function () {
        girder.events.on('g:login.success', this.redisplay, this);
        girder.events.on('g:logout.success', function () {
            this.render();

            if (_.has(imagespace, 'userData') &&
                _.has(imagespace.userData, 'images')) {
                imagespace.userData.images.reset([]);
            }
        }, this);
    },

    render: function () {
        this.$el.html(imagespace.templates.layoutHeaderUser({
            user: girder.currentUser
        }));

        return this;
    }
});
