imagespace.views.LayoutUserDataView = imagespace.View.extend({
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
                    imagespace.userData.images = new imagespace.collections.ImageCollection(null, {
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
            this.$el.html(imagespace.templates.userData());

            if (_.size(imagespace.userData.images)) {
                imagespace.userData.images.each(function (image) {
                    var imageView = new imagespace.views.UploadedImageView({
                        model: image,
                        parentView: this
                    });

                    this.$('#im-user-images').append(imageView.render().el);
                }, this);

                $('#sidebar-wrapper').show();
                $('#wrapper').removeClass('toggled');
            }

        }, this));

        return this;
    }
});
