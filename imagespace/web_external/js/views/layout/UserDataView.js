imagespace.views.LayoutUserDataView = imagespace.View.extend({
    initialize: function (settings) {
        girder.cancelRestRequests('fetch');
        imagespace.userData.images = new imagespace.collections.ImageCollection(null, {
            model: imagespace.models.UploadedImageModel,
            noFilter: true
        }).on('all', function (eventName) {
            if (_.contains(['add', 'remove', 'update', 'reset', 'sort'], eventName)) {
                this.render();
            }
        }, this);

        this.updateUserData();
    },

    /**
     * Updates the data from a users private folders and adds
     * them to the userData.images collection.
     *
     * This needs to remain idempotent due to its use in render
     * methods.
     **/
    updateUserData: function (done) {
        done = (_.isFunction(done) ? done : function () {});

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
                    var models = [];

                    items.forEach(_.bind(function (item) {
                        var parts;
                        if (item.meta && item.meta.item_id) {
                            // Determine if the image is solr backed or not
                            if (item.meta.id.indexOf(imagespace.solrPrefix) === 0) {
                                models.push(new imagespace.models.ImageModel(item.meta));
                            } else {
                                models.push(new imagespace.models.UploadedImageModel(item.meta));
                            }

                            // Replace Girder token with current session's token if necessary
                            parts = item.meta.imageUrl.split('&token=');
                            if (parts.length === 2) {
                                imageModel.set('imageUrl', parts[0] + '&token=' + girder.cookie.find('girderToken'));
                            }
                        }
                    }, this));

                    imagespace.userData.images.set(models);

                    done();
                }, this));
            } else {
                done();
            }
        }, this));
    },

    render: function () {
        this.$el.html(imagespace.templates.userData({
            blur: localStorage.getItem('im-blur') || 'never'
        }));

        imagespace.updateBlurSetting(localStorage.getItem('im-blur') || 'never');

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
        } else {
            $('#wrapper').addClass('toggled');
            $('#sidebar-wrapper').hide();
        }

        return this;
    }
});
