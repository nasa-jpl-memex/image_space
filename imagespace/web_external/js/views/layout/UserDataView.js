imagespace.views.LayoutUserDataView = imagespace.View.extend({
    events: {
        'click .im-search-by-size': function () {
            this.searchBySizeWidget = new imagespace.views.SearchBySizeWidget({
                el: $('#g-dialog-container'),
                parentView: this
            });
            this.searchBySizeWidget.render();
        },

        'click .im-search-by-serial-number': function () {
            this.searchBySerialNumberWidget = new imagespace.views.SearchBySerialNumberWidget({
                el: $('#g-dialog-container'),
                parentView: this
            });
            this.searchBySerialNumberWidget.render();
        },

        'click .im-instructions': function () {
            this.instructionsWidget = new imagespace.views.InstructionsWidget({
                el: $('#g-dialog-container'),
                parentView: this
            });
            this.instructionsWidget.render();
        },

        'change #im-files': function () {
            var files = $('#im-files')[0].files;
            _.each(files, function (file) {
                this.upload(file);
            }, this);
        },

        'click #im-upload': function () {
            $('#im-files').click();
        },

        'dragenter #im-upload': function (e) {
            e.stopPropagation();
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = 'copy';
            d3.select('#im-upload')
                .classed('btn-success', true)
                .classed('btn-primary', false);
        },

        'dragleave #im-upload': function (e) {
            e.stopPropagation();
            e.preventDefault();
            d3.select('#im-upload')
                .classed('btn-success', false)
                .classed('btn-primary', true);
        },

        'dragover #im-upload': function (e) {
            e.preventDefault();
        },

        'drop #im-upload': function (e) {
            var files = e.originalEvent.dataTransfer.files;
            e.stopPropagation();
            e.preventDefault();
            if (files.length === 0) {
                this.loadUrl(e.originalEvent.dataTransfer.getData('URL'));
            } else {
                // d3.select('#im-upload')
                //     .classed('btn-success', false)
                //     .classed('btn-primary', true);
                _.each(files, function (file) {
                    this.upload(file);
                }, this);
            }
        },

        'click .im-details': function (event) {
            var id = $(event.currentTarget).attr('im-id'),
                image = this.imageIdMap[id];
            this.imageDetailWidget = new imagespace.views.ImageDetailWidget({
                el: $('#g-dialog-container'),
                image: image,
                parentView: this
            });
            this.imageDetailWidget.render();
        },

        'click .im-remove': function (event) {
            var id = $(event.currentTarget).attr('im-id'),
                ids = imagespace.userData.images.map(function (d) { return d.id; }),
                removeIndex = ids.indexOf(id);
            imagespace.userData.images.splice(removeIndex, 1);
            this.render();
        }
    },

    initialize: function (settings) {
        this.imageIdMap = {};
        girder.cancelRestRequests('fetch');
        this.render();
    },

    render: function () {
        this.$el.html(imagespace.templates.userData({
            userData: imagespace.userData,
            showText: true
        }));
        return this;
    },

    upload: function (file) {
        var reader = new FileReader();

        $('#im-upload')
            .addClass('btn-info disabled')
            .removeClass('btn-default')
            .html('<i class="icon-spin5 animate-spin"></i> Processing ...');

        reader.onload = _.bind(function (e) {
            var data = new Uint8Array(e.target.result);
            girder.restRequest({
                path: 'imagefeatures',
                data: data,
                method: 'POST',
                processData: false,
                contentType: 'application/octet-stream',
                headers: {
                    // 'Content-Type': 'application/octet-stream'
                    // 'X-HTTP-Method-Override': 'GET'
                }
            }).done(_.bind(function (image) {
                var dataURLReader = new FileReader();

                dataURLReader.onloadend = _.bind(function () {
                    image.imageUrl = dataURLReader.result;
                    console.log(image);
                    imagespace.userData.images.unshift(image);
                    this.render();
                }, this);

                dataURLReader.readAsDataURL(file);

                image.id = file.name;
                this.imageIdMap[image.id] = image;
            }, this));
        }, this);

        reader.readAsArrayBuffer(file);
    },

    loadUrl: function (url) {
        $('#im-upload')
            .addClass('btn-info disabled')
            .removeClass('btn-default')
            .html('<i class="icon-spin5 animate-spin"></i> Processing ...');

        girder.restRequest({
            path: 'imagefeatures',
            data: {
                url: url
            },
            method: 'POST'
        }).done(_.bind(function (image) {
            image.imageUrl = url;
            image.id = url;

            this.imageIdMap[image.id] = image;

            console.log(image);
            imagespace.userData.images.unshift(image);
            this.render();
        }, this));
    },

});
