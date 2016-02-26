/**
 * This is responsible for the IQR integration of the SMQTK ImageSpace plugin.
 * This adds 2 new events, 1 new route, and wraps an existing method:
 * New events:
 * 1) Click to start a new IQR session
 *    This creates an IQR session on the server side and re-renders the search view.
 * 2) Click to refine an existing IQR session
 *    When the user has initialized an IQR session and selected some pos/negative examples
 *    and want to refine it will PUT to the refine endpoint and then change the URL
 *    to enter the main entrypoint (fetching the new results).
 *    In a refined state pagination will still work since the collection is now an IqrImageCollection.
 * New route:
 *   The refine route mimics the search route with the exception of the classification parameter
 *   having no effect and should be removed. This is in place just so the user can permalink
 *   results from a given refinement.
 * Wrapping SearchView.render:
 *   This is wrapped to replace the captions of Image results with an AnnotationWidgetView
 *   when the user is in an IQR session.
 **/
girder.events.once('im:appload.after', function () {
    imagespace.smqtk = imagespace.smqtk || {
        iqr: {
            sessions: new imagespace.collections.IqrSessionCollection(),

            /**
             * Returns the IqrSessionModel representing the current IQR session (via the query string).
             * IQR is currently limited to logged in users.
             **/
            currentIqrSession: function () {
                var qs = imagespace.parseQueryString(),
                    session;

                if (girder.currentUser && _.has(qs, 'smqtk_iqr_session')) {
                    session = _.find(imagespace.smqtk.iqr.sessions.models, function (iqrSession) {
                        return iqrSession.get('name') === qs.smqtk_iqr_session;
                    });

                    if (_.isUndefined(session)) {
                        console.error('Unable to find IQR session in client side representation');
                    }
                }

                return session || false;
            }
        }
    };

    // @todo This route should probably be clarified, an iqr_session_id parameter is required
    imagespace.router.route('refine/:query(/params/:params)', 'refine', function (query, params) {
        imagespace.smqtk.iqr.sessions.fetch();
        imagespace.smqtk.iqr.sessions.once('g:changed', _.bind(function () {
            imagespace.headerView.render({query: query});

            if (_.has(imagespace, 'searchView')) {
                imagespace.searchView.destroy();
            }

            // @todo pass these into the constructor properly
            var coll = new imagespace.collections.IqrImageCollection();
            coll.params = coll.params || {};
            coll.params.sid = imagespace.smqtk.iqr.currentIqrSession().get('name');

            imagespace.searchView = new imagespace.views.SearchView({
                parentView: this.parentView,
                collection: coll
            });
            coll.fetch(coll.params || {});
        }, this));
    });

    girder.wrap(imagespace.views.SearchView, 'render', function (render) {
        render.call(this);

        var currentIqrSession = imagespace.smqtk.iqr.currentIqrSession();
        this.$('.pull-right').append(girder.templates.startIqrSession({
            currentIqrSession: currentIqrSession
        }));

        if (currentIqrSession) {
            // Render annotation widgets on each image (replacing the caption utilities)
            _.each(this.$('.im-caption'), _.bind(function (captionDiv, i) {
                var annotationWidgetView = new imagespace.views.AnnotationWidgetView({
                    /**
                     * The parent of the annotation widget should be the individual image view.
                     * Since `this` references the SearchView - we actually want the child view
                     * that represents the i'th image.
                     **/
                    parentView: this.getChildImageView(i)
                });

                $(captionDiv).replaceWith(annotationWidgetView.render().el);
            }, this));
        }
    });

    // create new iqr session, re-render search view with an iqr image collection
    imagespace.views.SearchView.prototype.events['click #smqtk-iqr-start-session'] = function (event) {
        var iqrSession = new imagespace.models.IqrSessionModel({
            meta: {
                pos_uuids: [],
                neg_uuids: []
            }
        });

        iqrSession.save().once('g:saved', _.bind(function () {
            imagespace.updateQueryParams({
                smqtk_iqr_session: iqrSession.get('name')
            });

            imagespace.searchView.render();
        }, this));

        imagespace.smqtk.iqr.sessions.add(iqrSession);
    };

    imagespace.views.SearchView.prototype.events['click #smqtk-iqr-refine'] = function (event) {
        var session = imagespace.smqtk.iqr.currentIqrSession();

        if (_.size(session.get('meta').pos_uuids) === 0 &&
            _.size(session.get('meta').neg_uuids) === 0) {
            alert('Refinement requires at least 1 positive or negative example.');
            return;
        }

        girder.restRequest({
            path: 'smqtk_iqr/refine',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                sid: session.get('name'),
                pos_uuids: session.get('meta').pos_uuids,
                neg_uuids: session.get('meta').neg_uuids
            })
        }).done(function () {
            var searchQuery = _.first(imagespace.getQueryTypeWithArguments(true));
            imagespace.router.navigate('refine/' + searchQuery + '/params/smqtk_iqr_session=' + session.get('name'), {
                trigger: true
            });
        }).error(console.error);
    };
});
