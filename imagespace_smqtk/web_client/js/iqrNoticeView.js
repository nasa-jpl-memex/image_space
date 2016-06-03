imagespace.views.IqrNoticeView = imagespace.View.extend({
    events: {
        'click .smqtk-iqr-quit-session': function (e) {
            if (_.has(imagespace.parseQueryString(), 'smqtk_iqr_session')) {
                imagespace.smqtk.iqr.currentIqrSession = false;
                imagespace.smqtk.iqr.refiningNotice(false);
                imagespace.setQueryParams(_.omit(imagespace.parseQueryString(),
                                                 ['smqtk_iqr_session']), {
                                                     trigger: true
                                                 });
            }
        }
    },

    render: function () {
        this.$el.html(girder.templates.iqrNotice());
        return this;
    }
});
