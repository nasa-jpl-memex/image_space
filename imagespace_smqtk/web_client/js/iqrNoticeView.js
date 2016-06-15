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

    initialize: function (settings) {
        // The user might rename the session, so re-render this when it changes
        this.listenTo(imagespace.smqtk.iqr.currentIqrSession, 'change', this.render);
    },

    render: function () {
        this.$el.html(girder.templates.iqrNotice({
            sessionName: imagespace.smqtk.iqr.currentIqrSession.get('name'),
            sessionId: imagespace.smqtk.iqr.currentIqrSession.get('meta').sid
        }));
        return this;
    }
});
