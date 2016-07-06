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
        // On change of user (login or logout), re-render the search view
        girder.events.on('g:login', function () {
            if (_.has(imagespace, 'searchView')) {
                imagespace.searchView.render();
            }
        });

        girder.events.on('g:login', this.redisplay, this);
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
