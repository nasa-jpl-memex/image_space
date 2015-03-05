
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
                "values": [1, 10000, 100000, 1000000],
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

    var bar = {
        "width": 800,
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

    function imageUrl(d) {
        var parts = d.id.split('/'),
            file = parts[parts.length - 1]
        return 'https://s3.amazonaws.com/roxyimages/' + file;
    }

    function showSearchResults(data, showText) {
        console.log(data);
        $('.image-space-search-results-row').removeClass('hidden');
        $('.image-space-search-results').empty();
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
            .attr('src', imageUrl);
        if (showText) {
            results.append('pre').text(function (d) { return d.content[0].trim().replace(/\n\s*\n/g, '\n'); });
        }
    }

    function textSearch() {
        var searchBox = $('<input type="text" class="form-control input-lg" placeholder="Search">');
        $('.image-space-search-heading').text("Search by image text")
        $('.image-space-search-info').text("Type in a search term and hit Enter. Images whose content contains the entered text are populated in the search results along with the extracted text.")
        $('.image-space-search-content').empty().append(searchBox);
        searchBox.keypress(function (event) {
            if (event.which === 13) {
                $('.search-progress').removeClass('hidden');
                d3.json('solr-query?query=' + encodeURIComponent(searchBox.val()), function (error, data) {
                    showSearchResults(data, true);
                    $('.search-progress').addClass('hidden');
                });
            }
        });
    }

    function similarityGraph() {
        var graph = $('<div style="height:900px;width:100%"></div>');
        $('.search-ui-progress').removeClass('hidden');
        $('.image-space-search-heading').text("Browse image similarity graph")
        $('.image-space-search-info').text("Each image is linked to the image most similar to it from a sample of 2,000 images. Click an image to see it and its similar neighbors in the search results. Similarity is performed by color histogram comparison.")
        $('.image-space-search-content').empty().append(graph);
        d3.json('image-knn', function (error, result) {
            console.log(result);
            graph.nodelink({
                data: result,
                width: $('.image-space-search-content').width(),
                height: 800,
                linkDistance: tangelo.accessor({value: 10}),
                nodeCharge: tangelo.accessor({value: -8}),
                nodeImage: function (d) { return (Math.random() < 300 * (1 / result.nodes.length)) ? imageUrl({id: d.file}) : ""; },
                click: function (d) {
                    var nearby = [];
                    nearby.push({
                        id: d.file
                    });
                    result.links.forEach(function (link) {
                        if (link.source === d) {
                            nearby.push({
                                id: link.target.file
                            });
                        }
                        if (link.target === d) {
                            nearby.push({
                                id: link.source.file
                            });
                        }
                    });
                    showSearchResults(nearby, false);
                }
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
                    $('.search-progress').removeClass('hidden');
                    console.log(item);
                    var q = 'tiff_imagelength:"' + item.datum.data.height + '" AND tiff_imagewidth:"' + item.datum.data.width + '"';
                    d3.json('solr-query?query=' + q, function (error, data) {
                        showSearchResults(data, false);
                        $('.search-progress').addClass('hidden');
                    });
                }).update();
            });
        }

        var visContainer = $('<div></div>');
        $('.image-space-search-heading').text("Filter by image size")
        $('.image-space-search-info').text("This scatterplot displays ~35 million images binned by image size. Click a dot to see images of that size in the search results.")
        $('.image-space-search-content').empty().append(visContainer);

        if (!sizeData) {
            $('.search-ui-progress').removeClass('hidden');
            d3.json('solr-pivot', function (error, result) {
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
                $('.search-ui-progress').addClass('hidden');
                displaySizeChart();
            });
        } else {
            displaySizeChart();
        }
    }

    var cameraData;
    function cameraFilter() {
        function displayCameraChart() {
            vg.parse.spec(bar, function(chart) {
                var vis = chart({
                    el: visContainer[0],
                    data: {
                        table: cameraData
                    }
                }).on("click", function(event, item) {
                    $('.search-progress').removeClass('hidden');
                    console.log(item);
                    var q = 'camera_serial_number:"' + item.datum.data.x + '"';
                    d3.json('solr-query?query=' + q, function (error, data) {
                        showSearchResults(data, false);
                        $('.search-progress').addClass('hidden');
                    });
                }).update();
            });
        }

        var visContainer = $('<div></div>');
        $('.image-space-search-heading').text("Filter by camera serial number")
        $('.image-space-search-info').text("This bar chart displays images binned by the camera serial number found in EXIF metadata. Click a bar to see images of from that camera.")
        $('.image-space-search-content').empty().append(visContainer);

        if (!cameraData) {
            $('.search-ui-progress').removeClass('hidden');
            d3.json('solr-pivot?pivot=camera_serial_number', function (error, result) {
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
                $('.search-ui-progress').addClass('hidden');
                displayCameraChart();
            });
        } else {
            displayCameraChart();
        }
    }

    $('.image-space-nav-size').click(function () {
        $('.navbar-nav li').removeClass('active');
        $('.image-space-nav-size').parent().addClass('active');
        sizeFilter();
        return false;
    });

    $('.image-space-nav-camera').click(function () {
        $('.navbar-nav li').removeClass('active');
        $('.image-space-nav-camera').parent().addClass('active');
        cameraFilter();
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

    $('.navbar-brand').click(function () {
        $('.navbar-nav li').removeClass('active');
        $('.image-space-search-heading').text("Select a search mode above to begin")
        $('.image-space-search-info').text("This app was developed for the JPL / Kitware / Continuum Memex team using Apache Tika and SolrCell.")
        $('.image-space-search-content').empty();
        return false;
    });

    $('.navbar-brand').click();

});
