imagespace.views.AnnotationWidgetView = imagespace.View.extend({
    events: {
        'click .smqtk-iqr-annotation button': function (e) {
            var button = $(e.currentTarget),
                done = _.bind(this.render, this);

            if (button.hasClass('smqtk-iqr-positive')) {
                imagespace.smqtk.iqr.currentIqrSession.addPositiveUuid(this.image.get('sha1sum_s_md'), done);
            } else if (button.hasClass('smqtk-iqr-negative')) {
                imagespace.smqtk.iqr.currentIqrSession.addNegativeUuid(this.image.get('sha1sum_s_md'), done);
            }
        },
    },

    initialize: function (settings) {
        this.image = settings.parentView.model;
    },

    render: function () {
        var session = imagespace.smqtk.iqr.currentIqrSession,
            positive = _.contains(session.get('meta').pos_uuids, this.image.get('sha1sum_s_md')),
            negative = _.contains(session.get('meta').neg_uuids, this.image.get('sha1sum_s_md'));

        this.$el.html(girder.templates.iqrAnnotationWidget({
            positive: positive,
            negative: negative
        }));
        return this;
    }
});
