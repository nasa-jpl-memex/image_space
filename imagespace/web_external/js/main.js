$(function () {
    covalic.events.trigger('g:appload.before');
    var app = new covalic.App({
        el: 'body',
        parentView: null
    });
    covalic.events.trigger('g:appload.after');
});
