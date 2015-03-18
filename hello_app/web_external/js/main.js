$(function () {
    hello_app.events.trigger('g:appload.before');
    var app = new hello_app.App({
        el: 'body',
        parentView: null
    });
    hello_app.events.trigger('g:appload.after');
});
