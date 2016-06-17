imagespace.views.IqrNoticeView = imagespace.View.extend({
    events: {
        'click .smqtk-iqr-quit-session': function (e) {
            imagespace.smqtk.iqr.quitIqrSession();
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
