covalic.views.ChallengeLearnView = covalic.View.extend({

    events: {
    },

    initialize: function (settings) {
        girder.cancelRestRequests('fetch');
        this.render();
    },

    render: function () {
        this.$el.html(covalic.templates.challengeLearn({
            imgRoot: girder.staticRoot + '/built/plugins/covalic/extra/img'
        }));
        var jumboHeight = $('.jumbotron').outerHeight();
        var parallax = function () {
            var scrolled = $(window).scrollTop();
            $('.bg').css('height', (jumboHeight-scrolled) + 'px');
        };

        $(window).scroll(function(e){
            parallax();
        });
    }

});

covalic.router.route('challenges/learn', 'challenges/learn', function () {
    girder.events.trigger('g:navigateTo', covalic.views.ChallengeLearnView);
});
