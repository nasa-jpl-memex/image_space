$(function () {

    girder.restRequest({
        path: 'imageprefix'
    }).done(function (result) {
        imagespace.prefix = result.prefix;
        imagespace.stolenCameraPrefix = result.stolenCameraPrefix;
        imagespace.solrPrefix = result.solrPrefix;
        imagespace.facetviewAdsUrl = result.facetviewAdsUrl || false;
        imagespace.events.trigger('g:appload.before');
        window.app = new imagespace.App({
            el: 'body',
            parentView: null
        });
        imagespace.events.trigger('g:appload.after');
        girder.events.trigger('im:appload.after');
    });
});
