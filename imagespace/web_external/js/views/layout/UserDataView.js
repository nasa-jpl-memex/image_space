imagespace.views.LayoutUserDataView = imagespace.View.extend({
    events: {
        'click .im-search-by-size': function () {
            this.searchBySizeWidget = new imagespace.views.SearchBySizeWidget({
                el: $('#g-dialog-container'),
                parentView: this
            });
            this.searchBySizeWidget.render();
        },

        'change input[name=blur-options]': function (e) {
            localStorage.setItem('im-unblur', $(e.currentTarget).val());
            this.updateUnblur($(e.currentTarget).val());
        },

        'click .im-search-by-serial-number': function () {
            this.searchBySerialNumberWidget = new imagespace.views.SearchBySerialNumberWidget({
                el: $('#g-dialog-container'),
                parentView: this
            });
            this.searchBySerialNumberWidget.render();
        }
    },

    updateUnblur: function (val) {
        var options = {
            never: 'img.im-blur { -webkit-filter: blur(10px); filter: blur(10px) }',
            always: '',
            hover: 'img.im-blur { -webkit-filter: blur(10px); filter: blur(10px) }' +
                '\nimg.im-blur:hover { -webkit-filter: blur(0px); filter: blur(0px) }'
        };

        $('#blur-style').text(options[val]);
    },

    initialize: function (settings) {
        girder.cancelRestRequests('fetch');
    },

    updateUserData: function (done) {
        var _this = this;

        girder.restRequest({
            path: 'folder?text=Private'
        }).done(_.bind(function (folders) {
            var privateFolder = null;
            folders.forEach(function (folder) {
                if (folder.parentId === girder.currentUser.id) {
                    privateFolder = folder;
                }
            });

            if (privateFolder) {
                girder.restRequest({
                    path: 'item?limit=100&offset=0&sort=created&sortdir=-1&folderId=' + privateFolder._id
                }).done(_.bind(function (items) {
                    imagespace.userData.images = new imagespace.collections.SearchResultCollection(null, {
                        model: imagespace.models.UploadedImageModel
                    });

                    items.forEach(_.bind(function (item) {
                        var parts;
                        if (item.meta && item.meta.item_id) {
                            var imageModel = new imagespace.models.UploadedImageModel(item.meta);
                            imagespace.userData.images.add(imageModel);

                            // Replace Girder token with current session's token if necessary
                            parts = item.meta.imageUrl.split('&token=');
                            if (parts.length === 2) {
                                imageModel.set('imageUrl', parts[0] + '&token=' + girder.cookie.find('girderToken'));
                            }
                        }
                    }, this));
                    done();
                }, this));
            } else {
                done();
            }
        }, this));
    },

    render: function () {
        this.updateUserData(_.bind(function () {
            this.$el.html(imagespace.templates.userData({
                unblur: localStorage.getItem('im-unblur') || 'never'
            }));

            this.updateUnblur(localStorage.getItem('im-unblur') || 'never');

            if (_.size(imagespace.userData.images)) {
                imagespace.userData.images.each(function (image) {
                    var imageView = new imagespace.views.UploadedImageView({
                        model: image,
                        parentView: this
                    });

                    this.$('#im-user-images').append(imageView.render().el);
                }, this);
            }

        }, this));
        return this;
    }
});
