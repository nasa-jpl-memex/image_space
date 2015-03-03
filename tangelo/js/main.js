
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

    function textSearch() {
        var searchBox = $('<input type="text" class="form-control input-lg" placeholder="Search">');
        $('.image-space-search-heading').text("Search by image text")
        $('.image-space-search-content').empty().append(searchBox);
        searchBox.keypress(function (event) {
            if (event.which === 13) {
                $('.search-progress').removeClass('hidden');
                d3.json('solr-query?query=' + encodeURIComponent(searchBox.val()), function (error, data) {
                    $('.image-space-search-results').empty();
                    function imageUrl(d) {
                        var parts = d.id.split('/'),
                            file = parts[parts.length - 1]
                        return 'https://s3.amazonaws.com/roxyimages/' + file;
                    }
                    var results = d3.select('.image-space-search-results').selectAll('div')
                        .data(data)
                        .enter().append('div')
                        .attr('class', 'col-xs-6 col-md-3');
                    results.append('a')
                        .attr('href', imageUrl)
                        .attr('target', '_blank')
                        .attr('class', 'thumbnail')
                        .append('img')
                        .attr('class', 'blur')
                        .attr('src', imageUrl)
                    results.append('pre').text(function (d) { return d.content[0].trim(); });
                    $('.search-progress').addClass('hidden');
                });
            }
        });
    }

    function similarityGraph() {
        var graph = $('<div style="height:400px;width:100%"></div>');
        $('.search-ui-progress').removeClass('hidden');
        $('.image-space-search-heading').text("Browse image similarity graph")
        $('.image-space-search-content').empty().append(graph);
        d3.json('image-knn', function (error, result) {
            console.log(result);
            graph.nodelink({
                data: result,
                width: 400,
                height: 400
            });
            $('.search-ui-progress').addClass('hidden');
        });
    }

    var sizeData;
    function sizeFilter() {
        function displaySizeChart() {
            vg.parse.spec(scatterplot, function(chart) {
                var vis = chart({
                    el: visContainer[0],
                    data: {
                        table: sizeData
                    }
                }).on("click", function(event, item) {
                    console.log(item);
                }).update();
            });
        }

        var visContainer = $('<div></div>');
        $('.image-space-search-heading').text("Filter by image size")
        $('.image-space-search-content').empty().append(visContainer);

        if (!sizeData) {
            $('.search-ui-progress').removeClass('hidden');
            d3.json('solr-pivot', function (error, result) {
                sizeData = [];
                result.forEach(function (d1) {
                    d1.pivot.forEach(function (d2) {
                        sizeData.push({
                            width: +d1.value,
                            height: +d2.value,
                            count: d2.count
                        });
                    });
                });
                $('.search-ui-progress').addClass('hidden');
                displaySizeChart();
            });
        } else {
            displaySizeChart();
        }
    }

    $('.image-space-nav-size').click(function () {
        $('.navbar-nav li').removeClass('active');
        $('.image-space-nav-size').parent().addClass('active');
        sizeFilter();
        return false;
    });

    $('.image-space-nav-text').click(function () {
        $('.navbar-nav li').removeClass('active');
        $('.image-space-nav-text').parent().addClass('active');
        textSearch();
        return false;
    });

    $('.image-space-nav-graph').click(function () {
        $('.navbar-nav li').removeClass('active');
        $('.image-space-nav-graph').parent().addClass('active');
        similarityGraph();
        return false;
    });

});
