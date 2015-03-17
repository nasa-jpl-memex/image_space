covalic.views.ScoringMetricsView = covalic.View.extend({

    events: {
        'click .c-add-metric': function () {
            if (!this.addMetricWidget) {
                this.addMetricWidget = new covalic.views.AddMetricWidget({
                    el: $('#g-dialog-container'),
                    phase: this.model,
                    parentView: this
                }).on('g:saved', function (metric) {
                    if (!this.model.has('metrics') || !this.model.get('metrics')) {
                        this.model.set('metrics', {});
                    }

                    var metrics = this._getMetricsState();

                    if (metrics) {
                        this.model.set('metrics', metrics)
                        this.model.get('metrics')[metric.id] = {
                            title: '',
                            weight: 0,
                            description: ''
                        };
                        this.openMetric = metric.id;
                        this.render();
                    }
                }, this);
            }
            this.addMetricWidget.render();
        },

        'click .c-copy-metrics': function () {
            if (!this.copyMetricsWidget) {
                this.copyMetricsWidget = new covalic.views.SelectPhaseWidget({
                    el: $('#g-dialog-container'),
                    phase: this.model,
                    title: 'Copy metric information from phase',
                    parentView: this
                }).on('c:phaseSelected', function (phase) {
                    this.model.set('metrics', phase.get('metrics'));
                    this.render();
                }, this);
            }
            this.copyMetricsWidget.render();
        },

        'click .c-save-metrics': function () {
            this.$('.g-validation-failed-message').empty();
            var metrics = this._getMetricsState();

            if (metrics) {
                this.model.set('metrics', metrics).once('c:metricsSaved', function () {
                    girder.events.trigger('g:alert', {
                        type: 'success',
                        icon: 'ok',
                        text: 'Metrics saved.',
                        timeout: 2000
                    });
                }, this).saveMetrics();
            }
        },

        'click .c-metric-remove-button': function (e) {
            $(e.currentTarget).parents('.c-metric-container').fadeOut(400, function () {
                $(this).remove();
            });
        },

        'input .c-metric-id': function (e) {
            var el = $(e.currentTarget);
            el.parents('.c-metric-container')
              .find('a.c-metric-id-panel-title')
              .text(el.val());
        }
    },

    _getMetricsState: function () {
        var metrics = {};
        var ok = _.every(this.$('.c-metric-container'), function (el) {
            el = $(el);
            var idInput = el.find('.c-metric-id');
            var metricId = idInput.val().trim();
            if (!metricId) {
                this.$('.g-validation-failed-message').text(
                    'Metric identifier field must not be empty.');
                idInput.focus();
                return false;
            }
            if (_.has(metrics, metricId)) {
                this.$('.g-validation-failed-message').text(
                    'Duplicate metric identifier: ' + metricId + '.');
                idInput.focus();
                return false;
            }

            metrics[metricId] = {
                title: el.find('.c-metric-title').val().trim(),
                description: el.find('.c-metric-description').val().trim(),
                weight: window.Number(el.find('.c-metric-weight').val() || 0)
            };

            return true;
        }, this);

        if (ok) {
            return metrics;
        } else {
            return false;
        }
    },

    initialize: function (settings) {
        girder.events.on('c:joinPhase', this.render, this);
        girder.cancelRestRequests('fetch');

        this.model = settings.phase;
        this.openMetric = settings.openMetric || null;

        if (this.challenge) {
            this.render();
        } else {
            this.challenge = new covalic.models.ChallengeModel();
            this.challenge.set({
                _id: this.model.get('challengeId')
            }).on('g:fetched', function () {
                this.render();
            }, this).fetch();
        }
    },

    render: function () {
        this.$el.html(covalic.templates.scoringMetrics({
            phase: this.model,
            challenge: this.challenge,
            openMetric: this.openMetric,
            _: _
        }));

        this.$('button[title],.c-metric-remove-button').tooltip({
            placement: 'left'
        });

        if (this.openMetric) {
            var el = this.$('.c-metric-id[value="' + this.openMetric + '"]');
            el.focus();
            window.scrollTo(el.offset().top);
        }
        return this;
    }
});

covalic.router.route('phase/:id/metrics', 'phaseMetrics', function(id, params) {
    // Fetch the phase by id, then render the view.
    var phase = new covalic.models.PhaseModel();
    phase.set({
        _id: id
    }).on('g:fetched', function () {
        girder.events.trigger('g:navigateTo', covalic.views.ScoringMetricsView, {
            phase: phase
        });
    }, this).on('g:error', function () {
        covalic.router.navigate('challenges', {trigger: true});
    }, this).fetch();
});
