/**
 * Dialog for selecting a phase by ID.
 */
imagespace.views.SearchBySerialNumberWidget = imagespace.View.extend({
    events: {
    },

    initialize: function (settings) {
        this.title = settings.title || 'Serial number distribution';
    },

    render: function () {
        var modal = this.$el.html(imagespace.templates.searchBySerialNumberWidget({
            title: this.title
        })).girderModal(this).on('shown.bs.modal', _.bind(function () {
            var query = $('.im-search').val(),
                bar = {
                "width": 500,
                "height": 200,
                "padding": {"top": 10, "left": 30, "bottom": 80, "right": 10},
                "data": [
                    {
                        "name": "table",
                    }
                ],
                "scales": [
                    {
                        "name": "x",
                        "type": "ordinal",
                        "range": "width",
                        "domain": {"data": "table", "field": "data.x"}
                    },
                    {
                        "name": "y",
                        "range": "height",
                        "nice": true,
                        "domain": {"data": "table", "field": "data.y"}
                    }
                ],
                "axes": [
                    {
                        "type": "x",
                        "scale": "x",
                        "properties": {
                            "labels": {
                                "angle": {"value": -90},
                                "fontSize": {"value": 8},
                                "align": {"value": "right"},
                            }
                        }
                    },
                    {"type": "y", "scale": "y"}
                ],
                "marks": [
                    {
                        "type": "rect",
                        "from": {"data": "table"},
                        "properties": {
                            "enter": {
                                "x": {"scale": "x", "field": "data.x"},
                                "width": {"scale": "x", "band": true, "offset": -1},
                                "y": {"scale": "y", "field": "data.y"},
                                "y2": {"scale": "y", "value": 0}
                            },
                            "update": {
                                "fill": {"value": "steelblue"}
                            },
                            "hover": {
                                "fill": {"value": "red"}
                            }
                        }
                    }
                ]
            };

            girder.restRequest({
                path: 'imagepivot',
                data: {
                    pivot: 'camera_serial_number',
                    query: (query.trim().length === 0 ? '*' : query)
                }
            }).done(_.bind(function (result) {
                cameraData = [];
                console.log(result);
                result.forEach(function (d1) {
                    if (d1.value.trim().length > 0) {
                        cameraData.push({
                            x: d1.value,
                            y: d1.count
                        });
                    }
                });

                vg.parse.spec(bar, _.bind(function(chart) {
                    this.$('.im-working').addClass('hidden');
                    var vis = chart({
                        el: '.im-chart-content',
                        data: {
                            table: cameraData
                        }
                    }).on("click", _.bind(function(event, item) {
                        var newQuery = query;
                        if (newQuery.trim().length > 0) {
                            newQuery += ' AND ';
                        }
                        newQuery += 'camera_serial_number:"' + item.datum.data.x + '"';
                        this.$el.modal('hide');
                        imagespace.router.navigate('search/' + encodeURIComponent(newQuery), {trigger: true});
                    }, this)).update();
                }, this));

            }, this));

        }, this));

        modal.trigger($.Event('ready.girder.modal', {relatedTarget: modal}));

        return this;
    },

});
