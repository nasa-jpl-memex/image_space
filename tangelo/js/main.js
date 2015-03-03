
$(function () {
    var scatterplot = {
        "width": 800,
        "height": 500,
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
                "range": [5, 500]
            }
        ],
        "axes": [
            {"type": "x", "scale": "x", "offset": 5, "ticks": 5, "title": "Image Width"},
            {"type": "y", "scale": "y", "offset": 5, "ticks": 5, "title": "Image Height"}
        ],
        "legends": [
            {
                "size": "s",
                "title": "Count",
                "values": [1, 10, 100, 1000, 10000, 100000, 1000000],
                "format": ",g",
                "properties": {
                    "symbols": {
                        "fillOpacity": {"value": 0.5},
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
                        "fillOpacity": {"value": 0.5},
                        "stroke": {"value": "transparent"}
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

    d3.json('image-knn', function (error, result) {
        console.log(result);
        $('.imgspace-image-knn').nodelink({
            data: result,
            width: $('.imgspace-image-knn').width(),
            height: $('.imgspace-image-knn').height()
        });
    });

    d3.json('solr-pivot', function (error, result) {
        var data = [];
        result.forEach(function (d1) {
            d1.pivot.forEach(function (d2) {
                data.push({
                    width: +d1.value,
                    height: +d2.value,
                    count: d2.count
                });
            });
        });
        console.log(data);
        vg.parse.spec(scatterplot, function(chart) {
            chart({
                el:".imgspace-sizes",
                data: {
                    table: data
                }
            }).update();
        });
    });

    // d3.json('similarity', function (error, result) {
    //     console.log(data);
    // });

    $('.imgspace-text-search').keypress(function (event) {
        if (event.which === 13) {
            d3.json('solr-query/' + encodeURIComponent($('.imgspace-text-search').val()), function (error, data) {
                d3.select('.imgspace-text-search-results').selectAll('div').remove();
                var results = d3.select('.imgspace-text-search-results').selectAll('div').data(data).enter().append('div');
                results.append('pre').text(function (d) { return d.content[0].trim(); });
                results.append('img')
                    // .attr('class', 'blur')
                    .attr('src', function (d) { return 'https://s3.amazonaws.com/roxyimages/' + d.Filename; });
                console.log(data);
            });
        }
    });

});
