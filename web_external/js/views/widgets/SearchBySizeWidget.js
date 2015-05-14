/**
 * Dialog for selecting a phase by ID.
 */
imagespace.views.SearchBySizeWidget = imagespace.View.extend({
    events: {
    },

    initialize: function (settings) {
        this.title = settings.title || 'Image size distribution';
    },

    render: function () {
        var modal = this.$el.html(imagespace.templates.searchBySizeWidget({
            title: this.title
        })).girderModal(this).on('shown.bs.modal', _.bind(function () {
            var query = $('.im-search').val(),
                scatterplot = {
                "width": 400,
                "height": 300,
                "data": [
                    {
                        "name": "table"
                    }
                ],
                "scales": [
                    {
                        "name": "x",
                        "nice": true,
                        "range": "width",
                        "zero": false,
                        "domain": {"data": "table", "field": "data.width"}
                    },
                    {
                        "name": "y",
                        "nice": true,
                        "range": "height",
                        "zero": false,
                        "domain": {"data": "table", "field": "data.height"}
                    },
                    {
                        "name": "s",
                        // "type": "log",
                        "nice": false,
                        "domain": {"data": "table", "field": "data.count"},
                        // "zero": true,
                        "range": [10, 500]
                    }
                ],
                "axes": [
                    {"type": "x", "scale": "x", "offset": 5, "ticks": 5, "title": "Image width"},
                    {"type": "y", "scale": "y", "offset": 5, "ticks": 5, "title": "Image height"}
                ],
                "legends": [
                    {
                        "size": "s",
                        "title": "Count",
                        // "values": [1, 10000, 100000, 1000000],
                        "format": ",g",
                        "properties": {
                            "symbols": {
                                "fillOpacity": {"value": 0.25},
                                "fill": {"value": "steelblue"},
                                "stroke": {"value": "transparent"}
                            }
                        }
                    }
                ],
                "marks": [
                    {
                        "type": "symbol",
                        "from": {"data": "table"},
                        "properties": {
                            "enter": {
                                "x": {"scale": "x", "field": "data.width"},
                                "y": {"scale": "y", "field": "data.height"},
                                "size": {"scale": "s", "field": "data.count"},
                                "stroke": {"value": "transparent"}
                            },
                            "update": {
                                "fillOpacity": {"value": 0.25},
                                "fill": {"value": "steelblue"}
                            },
                            "hover": {
                                "fillOpacity": {"value": 1.0},
                                "fill": {"value": "red"}
                            }
                        }
                    }
                ]
            };

            girder.restRequest({
                path: 'imagepivot',
                data: {
                    query: (query.trim().length === 0 ? '*' : query)
                }
            }).done(_.bind(function (result) {
                sizeData = [];
                console.log(result);
                result.forEach(function (d1) {
                    d1.pivot.forEach(function (d2) {
                        sizeData.push({
                            height: +d1.value,
                            width: +d2.value,
                            count: d2.count
                        });
                    });
                });

                vg.parse.spec(scatterplot, _.bind(function(chart) {
                    this.$('.im-working').addClass('hidden');
                    var vis = chart({
                        el: '.im-search-by-size-content',
                        data: {
                            table: sizeData
                        }
                    }).on("click", _.bind(function(event, item) {
                        var newQuery = query;
                        if (newQuery.trim().length > 0) {
                            newQuery += ' AND ';
                        }
                        newQuery += 'tiff_imagelength:"' + item.datum.data.height + '" AND tiff_imagewidth:"' + item.datum.data.width + '"';
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
