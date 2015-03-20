imagespace.views.LayoutHeaderView = imagespace.View.extend({
    events: {
        'click .im-nav-link': function (event) {
            var link = $(event.currentTarget);
            console.log('click');

            imagespace.router.navigate(link.attr('im-target'), {trigger: true});

            // Must call this after calling navigateTo, since that
            // deactivates all global nav links.
            link.addClass('active');
        },

        'keypress .im-search': function (event) {
            if (event.which === 13) {
                var query = encodeURIComponent($(event.currentTarget).val());
                imagespace.router.navigate('search/' + query, {trigger: true});
            }
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
            d3.select('#im-upload')
                .classed('btn-success', false)
                .classed('btn-primary', true);
            _.each(files, function (file) {
                this.upload(file);
            }, this);
        }

    },

    render: function () {
        this.$el.html(imagespace.templates.layoutHeader());

        this.$('a[title]').tooltip({
            placement: 'bottom',
            delay: {show: 300}
        });

        new imagespace.views.LayoutHeaderUserView({
            el: this.$('.h-current-user-wrapper'),
            parentView: this
        }).render();
    },

    upload: function (file) {
        var reader = new FileReader();

        reader.onload = _.bind(function (e) {
            console.log(e);
            girder.restRequest({
                path: 'imagefeatures',
                data: new Uint8Array(e.target.result),
                method: 'POST',
                processData: false,
                contentType: 'application/octet-stream',
                headers: {
                    // 'Content-Type': 'application/octet-stream'
                    // 'X-HTTP-Method-Override': 'GET'
                }
            }).done(function (features) {
                features['id'] = file.name;
                console.log(features);
            });
        }, this);

        reader.readAsArrayBuffer(file);
    },

});
