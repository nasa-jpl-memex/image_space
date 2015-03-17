covalic.views.ScoreDetailWidget = covalic.View.extend({
    initialize: function (settings) {
        this.submission = settings.submission;
        this.phase = settings.phase;
        this.score = this.submission.get('score');

        this.metrics = _.map(this.score[0].metrics, function (metric) {
            return metric.name;
        });

        this.datasets = _.map(this.score, function (dataset) {
            return dataset.dataset;
        });
    },

    render: function () {
        this.$el.html(covalic.templates.scoreDetails({
            datasets: this.datasets,
            metrics: this.metrics,
            getScoreForCell: _.bind(this.getScoreForCell, this)
        }));

        var metricsInfo = this.phase.get('metrics') || {};
        _.each(this.$('.c-metric-heading'), function (heading) {
            var el = $(heading),
                metricId = el.attr('metric'),
                metricInfo = metricsInfo[metricId] || {},
                title = metricInfo.title || metricId,
                description = metricInfo.description ?
                    girder.renderMarkdown(metricInfo.description) : null,
                weight = metricInfo.weight || 0;

            el.popover({
                title: title,
                container: this.$el,
                trigger: 'focus',
                placement: 'auto',
                content: covalic.templates.metricInfo({
                    description: description,
                    weight: weight
                }),
                html: true
            });
        }, this);
    },

    getScoreForCell: function (dataset, metric) {
        var score;
        _.every(this.score, function (d) {
            if (d.dataset === dataset) {
                _.every(d.metrics, function (m) {
                    if (m.name === metric) {
                        score = m.value;
                        return false;
                    }
                    return true;
                });
                return false;
            }
            return true;
        });

        if (score < 0.0001) {
            return Number(score).toExponential(2);
        } else {
            return Number(score).toPrecision(4);
        }
    }
});
