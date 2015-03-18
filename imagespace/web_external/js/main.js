$(function () {
    imagespace.events.trigger('g:appload.before');
    var app = new imagespace.App({
        el: 'body',
        parentView: null
    });
    imagespace.events.trigger('g:appload.after');
});
