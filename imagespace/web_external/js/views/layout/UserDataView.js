imagespace.views.LayoutUserDataView = imagespace.View.extend({
    events: {
        'click .im-search-by-size': function () {
            this.searchBySizeWidget = new imagespace.views.SearchBySizeWidget({
                el: $('#g-dialog-container'),
                parentView: this
            });
            this.searchBySizeWidget.render();
        },

        'click .im-blur': function () {
            $('#blur-style').text('img.im-blur { -webkit-filter: blur(10px); filter: blur(10px) }');
        },

        'click .im-unblur-hover': function () {
            $('#blur-style').text(
                'img.im-blur { -webkit-filter: blur(10px); filter: blur(10px) }'
                + '\nimg.im-blur:hover { -webkit-filter: blur(0px); filter: blur(0px) }');
        },

        'click .im-unblur': function () {
            $('#blur-style').text('');
        },

        'click .im-search-by-serial-number': function () {
            this.searchBySerialNumberWidget = new imagespace.views.SearchBySerialNumberWidget({
                el: $('#g-dialog-container'),
                parentView: this
            });
            this.searchBySerialNumberWidget.render();
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
                image = this.imageIdMap[id],
                item = new girder.models.ItemModel({
                    _id: image.item_id
                });

            if (image.item_id) {
                item.once('g:deleted', function () {
                    this.render();
                }, this).destroy();
            }
        },

        'click .im-find-similar': function (event) {
            var id = $(event.currentTarget).attr('im-id'),
                image = this.imageIdMap[id];
            imagespace.router.navigate('search/' + encodeURIComponent(image.imageUrl) + '/content', {trigger: true});

            this.$('.btn-lg').addClass('disabled');
            $(event.currentTarget).parent().find('.im-find-similar')
                .html('<i class="icon-spin5 animate-spin"></i>');
        },

        'mouseover .im-image-area': function (event) {
            $(event.currentTarget).find('.im-caption-content').removeClass('hidden');
        },

        'mouseout .im-image-area': function (event) {
            $(event.currentTarget).find('.im-caption-content').addClass('hidden');
        }
    },

    initialize: function (settings) {
        this.imagePathRoot = '/data/roxyimages/';
        // this.imagePathRoot = '/data/xdata/syria/syria_instagram_images/';
        this.resLimit = 30;
        this.imageIdMap = {};
        girder.cancelRestRequests('fetch');
    },

    updateUserData: function (done) {
        girder.restRequest({
            path: 'folder?text=Private'
        }).done(_.bind(function (folders) {
            var privateFolder = null;
            folders.forEach(function (folder) {
                if (folder.parentId === girder.currentUser.id) {
                    privateFolder = folder;
                }
            });
            imagespace.userData.images = [];
            if (privateFolder) {
                girder.restRequest({
                    path: 'item?limit=100&offset=0&sort=created&sortdir=-1&folderId=' + privateFolder._id
                }).done(_.bind(function (items) {
                    items.forEach(_.bind(function (item) {
                        var parts;
                        if (item.meta && item.meta.item_id) {
                            imagespace.userData.images.push(item.meta);
                            this.imageIdMap[item.meta.id] = item.meta;

                            // Replace Girder token with current session's token if necessary
                            parts = item.meta.imageUrl.split('&token=');
                            if (parts.length === 2) {
                                item.meta.imageUrl = parts[0] + '&token=' + girder.cookie.find('girderToken');
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
                userData: imagespace.userData,
                showText: true
            }));
        }, this));
        return this;
    }
});
