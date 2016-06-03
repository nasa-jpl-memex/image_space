imagespace.views.AnnotationWidgetView = imagespace.View.extend({
    tagName: 'div',
    className: 'smqtk-iqr-annotation',
    events: {
        'click .smqtk-iqr-annotate': function (e) {
            var button = $(e.currentTarget),
                done = _.bind(this.render, this);

            if (button.hasClass('smqtk-iqr-positive')) {
                if (this.isIqrPositive()) {
                    imagespace.smqtk.iqr.currentIqrSession.removePositiveUuid(this.image.get('sha1sum_s_md'), done);
                } else {
                    imagespace.smqtk.iqr.currentIqrSession.addPositiveUuid(this.image.get('sha1sum_s_md'), done);
                }
            } else if (button.hasClass('smqtk-iqr-negative')) {
                if (this.isIqrNegative()) {
                    imagespace.smqtk.iqr.currentIqrSession.removeNegativeUuid(this.image.get('sha1sum_s_md'), done);
                } else {
                    imagespace.smqtk.iqr.currentIqrSession.addNegativeUuid(this.image.get('sha1sum_s_md'), done);
                }
            }
        }
    },

    initialize: function (settings) {
        this.image = settings.parentView.model;
    },

    isIqrPositive: function () {
        return (imagespace.smqtk.iqr.currentIqrSession.has('meta') &&
                _.contains(imagespace.smqtk.iqr.currentIqrSession.get('meta').pos_uuids, this.image.get('sha1sum_s_md')));
    },

    isIqrNegative: function () {
        return (imagespace.smqtk.iqr.currentIqrSession.has('meta') &&
                _.contains(imagespace.smqtk.iqr.currentIqrSession.get('meta').neg_uuids, this.image.get('sha1sum_s_md')));
    },

    render: function () {
        this.$el.html(girder.templates.iqrAnnotationWidget({
            positive: this.isIqrPositive(),
            negative: this.isIqrNegative()
        }));
        return this;
    }
});
