covalic.models.PhaseModel = girder.AccessControlledModel.extend({
    resourceName: 'challenge_phase',

    fetchGroundtruthItems: function () {
        girder.restRequest({
            path: this.resourceName + '/' + this.get('_id') + '/groundtruth/item',
            type: 'GET'
        }).done(_.bind(function (resp) {
            this.set('groundtruthItems', resp);
            this.trigger('c:groundtruthItemsFetched', resp);
        }, this)).error(_.bind(function (err) {
            this.trigger('c:error', err);
        }, this));
    },

    saveMetrics: function () {
        girder.restRequest({
            path: this.resourceName + '/' + this.get('_id') + '/metrics',
            type: 'PUT',
            data: JSON.stringify(this.get('metrics') || {}),
            processData: false,
            contentType: 'application/json'
        }).done(_.bind(function (resp) {
            this.trigger('c:metricsSaved', resp);
        }, this)).error(_.bind(function (err) {
            this.trigger('c:error', err);
        }, this));
    }
});
