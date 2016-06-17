$(function () {

    /**
     * This is a somewhat hackish way of guaranteeing all of our
     * jade templates have access to the girder, imagespace, and _
     * globals.
     **/
    _(imagespace.templates).each(function (tmplFunc, tmplName) {
        imagespace.templates[tmplName] = function (args) {
            args = _.extend(args || {}, {
                girder: girder,
                imagespace: imagespace,
                _: _
            });

            return tmplFunc(args);
        };
    });

    girder.restRequest({
        path: 'imageprefix'
    }).done(function (result) {
        imagespace.prefix = result.prefix;
        imagespace.stolenCameraPrefix = result.stolenCameraPrefix;
        imagespace.solrPrefix = result.solrPrefix;
        imagespace.facetviewAdsUrl = result.facetviewAdsUrl || false;
        imagespace.localBasicAuth = result.localBasicAuth || false;
        imagespace.events.trigger('g:appload.before');
        window.app = new imagespace.App({
            el: 'body',
            parentView: null,
            start: false
        });

        window.app.start().then(function () {
            girder.events.trigger('g:appload.ready');
        });

        imagespace.events.trigger('g:appload.after');
        girder.events.trigger('im:appload.after');
    });
});
