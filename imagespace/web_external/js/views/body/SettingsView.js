imagespace.views.SettingsView = imagespace.View.extend({
    events: {
        'change input[name=blur-options]': function (e) {
            imagespace.updateBlurSetting($(e.currentTarget).val());
        }
    },

    render: function () {
        this.$el.html(imagespace.templates.settings({
            blur: localStorage.getItem('im-blur') || imagespace.defaultBlurSetting
        }));
        return this;
    }
});

imagespace.router.route('page/settings', 'settings-page', function () {
    imagespace.headerView.render();

    new imagespace.views.SettingsView({
        el: $('#g-app-body-container')
    }).render();
});
