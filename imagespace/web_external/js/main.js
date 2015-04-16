$(function () {

    girder.restRequest({
        path: 'imageprefix'
    }).done(function (result) {
        imagespace.prefix = result.prefix;
        imagespace.events.trigger('g:appload.before');
        var app = new imagespace.App({
            el: 'body',
            parentView: null
        });
        imagespace.events.trigger('g:appload.after');
    });
});
