imagespace.views.SearchBarView = imagespace.View.extend({
    events: {
        'click .im-nav-link': function (event) {
            var link = $(event.currentTarget);

            imagespace.router.navigate(link.attr('im-target'), {trigger: true});

            // Must call this after calling navigateTo, since that
            // deactivates all global nav links.
            link.addClass('active');
        },

        'click .im-search-image': function (event) {
            this.imageDetailWidget = new imagespace.views.ImageDetailWidget({
                el: $('#g-dialog-container'),
                image: this.image,
                parentView: this
            });
            this.imageDetailWidget.render();
        },

        'keypress .im-search': function (event) {
            var q = $(event.currentTarget).val();
            if (event.which === 13) {
                var query = encodeURIComponent(q);
                imagespace.router.navigate('search/' + query, {trigger: true});
            }
        },

        'input .im-search': function (event) {
            var q = $(event.currentTarget).val();
            if (q.length > 0) {
                $('.im-search-button').removeAttr('disabled');
            } else {
                $('.im-search-button').attr('disabled', 'disabled');
            }
        },

        'click .im-search-button': function (event) {
            var query = encodeURIComponent($('.im-search').val());
            imagespace.router.navigate('search/' + query, {trigger: true});
        },

        'click #advanced-search': function (event) {
            event.preventDefault();
            $('body').append('<div id="advanced-search-modal"></div>');
            var $el = $('#advanced-search-modal');
            $el.html(imagespace.templates.advancedSearchWidget()).girderModal(false);

            $el.find('a').on('click', function () {
                $el.modal('hide');
            });
        }
    },

    dropzoneEvents: {
        'change #im-files': function () {
            var files = $('#im-files')[0].files;
            _.each(files, function (file) {
                this.upload(file);
            }, this);
        },

        'click #im-upload .im-advanced-search-button': function () {
            $('#im-files').click();
        },

        'dragenter input.im-search': function (e) {
            e.stopPropagation();
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = 'copy';
            d3.select('input.im-search')
                .classed('btn-success', true)
                .classed('btn-primary', false);
        },

        'dragleave input.im-search': function (e) {
            e.stopPropagation();
            e.preventDefault();
            d3.select('input.im-search')
                .classed('btn-success', false)
                .classed('btn-primary', true);
        },

        'dragover input.im-search': function (e) {
            e.preventDefault();
        },

        'drop input.im-search': function (e) {
            var files = e.originalEvent.dataTransfer.files;
            e.stopPropagation();
            e.preventDefault();
            if (files.length === 0) {
                this.loadUrl(e.originalEvent.dataTransfer.getData('URL'));
            } else {
                _.each(files, function (file) {
                    this.upload(file);
                }, this);
            }
        }
    },

    initialize: function (settings) {
        this.settings = settings || {};
        this.settings.loggedIn = girder.currentUser;

        if (_.has(this.settings, 'image')) {
            this.settings.searches = imagespace.getApplicableSearches(this.settings.image);
        }

        if (settings.dropzone) {
            _.extend(this.events, this.dropzoneEvents);
        }
    },

    render: function () {
        this.$el.html(imagespace.templates.searchBarWidget(this.settings));
        return this;
    },

    upload: function (file) {
        var reader = new FileReader();

        $('input.im-search')
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
                contentType: 'application/octet-stream'
            }).done(_.bind(function (image) {
                var dataURLReader = new FileReader();

                dataURLReader.onloadend = _.bind(function () {
                    image.imageUrl = dataURLReader.result;
                    imagespace.userData.images.add(new imagespace.models.UploadedImageModel(image), {
                        at: 0
                    });
                    if (girder.currentUser) {
                        girder.restRequest({
                            path: 'folder?text=Private'
                        }).done(_.bind(function (folders) {
                            var privateFolder = null;
                            folders.forEach(function (folder) {
                                if (folder.parentId === girder.currentUser.id) {
                                    privateFolder = folder;
                                }
                            })
                            if (privateFolder) {
                                this.girderUpload(this.dataURLToBlob(dataURLReader.result), file.name, privateFolder._id, null, _.bind(function (fileObject) {
                                    var location = window.location, item;
                                    image.imageUrl = location.protocol + '//' + location.host + location.pathname + '/girder/api/v1/file/' + fileObject.id + '/download?token=' + girder.cookie.find('girderToken');
                                    item = new girder.models.ItemModel({_id: fileObject.attributes.itemId});
                                    image.item_id = fileObject.attributes.itemId;
                                    item._sendMetadata(image, _.bind(function () {
                                        this.render();
                                        imagespace.userDataView.render();
                                    }, this));
                                }, this));
                            }
                        }, this));
                    }
                }, this);

                dataURLReader.readAsDataURL(file);
                image.id = file.name;
            }, this));
        }, this);

        reader.readAsArrayBuffer(file);
    },

    loadUrl: function (url) {
        $('input.im-search')
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

            imagespace.addUserImage(image);
        }, this));
    },

    girderUpload: function (data, name, folderId, itemToOverwrite, success, error) {
        success = success || function () {};
        error = error || function () {};

        var file, bindEvents = function (file) {
            file.on('g:upload.complete', function () {
                success(file);
            }).on('g:upload.error', function () {
            }).on('g:upload.error g:upload.errorStarting', function () {
                error(file);
            });
            return file;
        };

        if (itemToOverwrite) {
            // We have the dataset's itemid, but we need its fileid.
            var files = new girder.collections.FileCollection();
            files.altUrl = 'item/' + itemToOverwrite + '/files';

            files.on('g:changed', function () {
                file = bindEvents(files.models[0]);
                file.updateContents(data);
            }).fetch();
        } else {
            var folder = new girder.models.FolderModel({_id: folderId});
            file = bindEvents(new girder.models.FileModel());
            file.uploadToFolder(folder, data, name);
        }

        return file;
    },

    dataURLToBlob: function (dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(','),
                contentType = parts[0].split(':')[1],
                raw = decodeURIComponent(parts[1]);

            return new Blob([raw], {type: contentType});
        }

        var parts = dataURL.split(BASE64_MARKER),
            contentType = parts[0].split(':')[1],
            raw = window.atob(parts[1]),
            rawLength = raw.length,
            uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }
});
