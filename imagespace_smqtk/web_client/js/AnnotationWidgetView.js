imagespace.views.AnnotationWidgetView = imagespace.View.extend({
    tagName: 'div',
    className: 'smqtk-iqr-annotation',
    events: {
        'click .smqtk-iqr-annotate': function (e) {
            var button = $(e.currentTarget),
                done = _.bind(this.render, this);

	    var sha1sum_s_md = null;
	    if (_.isArray(this.image.get('sha1sum_s_md'))){
		sha1sum_s_md = this.image.get('sha1sum_s_md')[0];
	    }
	    else sha1sum_s_md = this.image.get('sha1sum_s_md');

            if (button.hasClass('smqtk-iqr-positive')) {
                if (this.isIqrPositive()) {
                    imagespace.smqtk.iqr.currentIqrSession.removePositiveUuid(sha1sum_s_md, done);
                } else {
                    imagespace.smqtk.iqr.currentIqrSession.addPositiveUuid(sha1sum_s_md, done);
                }
            } else if (button.hasClass('smqtk-iqr-negative')) {
                if (this.isIqrNegative()) {
                    imagespace.smqtk.iqr.currentIqrSession.removeNegativeUuid(sha1sum_s_md, done);
                } else {
                    imagespace.smqtk.iqr.currentIqrSession.addNegativeUuid(sha1sum_s_md, done);
                }
            }
        }
    },

    initialize: function (settings) {
        this.image = settings.parentView.model;
    },

    isIqrPositive: function () {
                var sha1sum_s_md = null;
                if (_.isArray(this.image.get('sha1sum_s_md'))){
                    sha1sum_s_md = this.image.get('sha1sum_s_md')[0];
                }
                else sha1sum_s_md = this.image.get('sha1sum_s_md');     
        return (imagespace.smqtk.iqr.currentIqrSession.has('meta') &&
                _.contains(imagespace.smqtk.iqr.currentIqrSession.get('meta').pos_uuids, sha1sum_s_md));
    },

    isIqrNegative: function () {
                var sha1sum_s_md = null;
                if (_.isArray(this.image.get('sha1sum_s_md'))){
                    sha1sum_s_md = this.image.get('sha1sum_s_md')[0];
                }
                else sha1sum_s_md = this.image.get('sha1sum_s_md');
        return (imagespace.smqtk.iqr.currentIqrSession.has('meta') &&
                _.contains(imagespace.smqtk.iqr.currentIqrSession.get('meta').neg_uuids, sha1sum_s_md));
    },

    render: function () {
        this.$el.html(girder.templates.iqrAnnotationWidget({
            positive: this.isIqrPositive(),
            negative: this.isIqrNegative()
        }));
        return this;
    }
});
