/**
 * This is responsible for the IQR integration of the SMQTK ImageSpace plugin.
 * This adds 4 new events, 1 new route, and wraps 4 existing methods:
 * New events:
 * 1) Click to start a new IQR session
 *    This creates an IQR session on the server side and re-renders the search view.
 * 2) Click to refine an existing IQR session
 *    When the user has initialized an IQR session and selected some pos/negative examples
 *    and want to refine it will PUT to the refine endpoint and then change the URL
 *    to enter the main entrypoint (fetching the new results).
 *    In a refined state pagination will still work since the collection is now an IqrImageCollection.
 * 3) Click to load an existing IQR session
 *    When the user clicks this they are presented with a hierarchy widget of the directory
 *    storing their IQR sessions. On clicking an IQR session they are forced to the state that session
 *    was in when they last used it.
 * 4) Click to save an IQR session
 *    The notion of a "saved" IQR session is simply one that gets named by a user (see the above event).
 *    This is due to the (unsolved) issue of when to invalidate a session. As such, the save event just
 *    brings up the Edit Item widget for that particular IQR session item.
 * New route:
 *   The refine route mimics the search route with the exception of the classification parameter
 *   having no effect and should be removed. This is in place just so the user can permalink
 *   results from a given refinement.
 * Wrapped methods:
 * 1) Wrapping SearchView.render:
 *    This is wrapped to replace the captions of Image results with an AnnotationWidgetView
 *    when the user is in an IQR session.
 * 2) Wrapping LayoutHeaderView.render:
 *    This is wrapped just to allow a notice for the user when they are in the middle of an IQR session.
 * 3) Wrapping ItemListWidget.render:
 *    This is wrapped because of the Hierarchy Widget usage when loading an existing IQR session.
 *    For now, it's difficult to hook in to filter the items listed in the widget so we wrap render
 *    and remove the items we don't want (hacky). Specifically, we only want to show IQR sessions which
 *    have a name that isn't their SID (this is the indication that a user saved the session).
 * 4) Wrapping girder.views.EditItemWidget - for aesthetics.
 **/
girder.events.once('im:appload.after', function () {
    imagespace.smqtk = imagespace.smqtk || {
        iqr: {
            sessions: new imagespace.collections.IqrSessionCollection(),

            /**
             * Returns the IqrSessionModel representing the current IQR session (via the query string).
             * IQR is currently limited to logged in users.
             **/
            findIqrSession: function () {
                var qs = imagespace.parseQueryString(),
                    session;

                if (girder.currentUser && _.has(qs, 'smqtk_iqr_session')) {
                    session = _.find(imagespace.smqtk.iqr.sessions.models, function (iqrSession) {
                        return iqrSession.get('meta').sid === qs.smqtk_iqr_session;
                    });

                    if (_.isUndefined(session)) {
                        console.error('Unable to find IQR session in client side representation');
                    } else {
                        // @todo this should be handled properly with defaults
                        session.set('meta', session.get('meta') || {
                            pos_uuids: [],
                            neg_uuids: []
                        });
                    }
                }

                return session || false;
            },

            currentIqrSession: false,

            refiningNotice: function (enable) {
                if (enable && imagespace.smqtk.iqr.currentIqrSession !== false) {
                    if (!_.has(imagespace.smqtk.iqr, 'iqrNoticeView') || _.isUndefined(imagespace.smqtk.iqr.iqrNoticeView)) {
                        imagespace.smqtk.iqr.iqrNoticeView = new imagespace.views.IqrNoticeView({
                            parentView: null
                        });

                        $('nav.navbar-fixed-top').append(imagespace.smqtk.iqr.iqrNoticeView.render().el);
                    }

                    $('#wrapper').css('margin-top', '80px');
                    $('#im-classification-narrow').hide();
                    $('#smqtk-near-duplicates').hide();
                } else {
                    if (_.has(imagespace.smqtk.iqr, 'iqrNoticeView') &&
                        !_.isUndefined(imagespace.smqtk.iqr.iqrNoticeView)) {
                        imagespace.smqtk.iqr.iqrNoticeView.destroy();
                        imagespace.smqtk.iqr.iqrNoticeView = undefined;
                    }

                    $('#wrapper').css('margin-top', '');
                    $('#im-classification-narrow').show();
                    $('#smqtk-near-duplicates').show();
                }
            },

            quitIqrSession: function () {
                if (_.has(imagespace.parseQueryString(), 'smqtk_iqr_session')) {
                    imagespace.smqtk.iqr.currentIqrSession = false;
                    imagespace.smqtk.iqr.refiningNotice(false);
                    imagespace.setQueryParams(_.omit(imagespace.parseQueryString(),
                                                     ['smqtk_iqr_session']), {
                                                         trigger: true
                                                     });
                }
            }
        }
    };

    girder.events.on('g:appload.ready', function () {
        if (girder.currentUser !== null) {
            imagespace.smqtk.iqr.sessions.fetch();
        }
    });

    imagespace.smqtk.iqr.sessions.once('g:changed', function () {
        imagespace.smqtk.iqr.currentIqrSession = imagespace.smqtk.iqr.findIqrSession();
        girder.events.trigger('im:iqr-session-loaded');
    });

    /**
     * Supplants the current imagespace.searchView with one that uses an
     * IQR Image Collection instead.
     **/
    imagespace.smqtk.iqr.RefineView = _.bind(function () {
        if (_.has(imagespace, 'searchView')) {
            imagespace.searchView.destroy();
        }

        // @todo pass these into the constructor properly
        var coll = new imagespace.collections.IqrImageCollection();
        coll.params = coll.params || {};
        coll.params.sid = imagespace.smqtk.iqr.currentIqrSession.get('meta').sid;

        imagespace.searchView = new imagespace.views.SearchView({
            parentView: this.parentView,
            collection: coll
        });
        coll.fetch(coll.params || {}, true);
    }, this);

    imagespace.smqtk.iqr.createOrUpdateRefineView = function () {
        if (imagespace.searchView.collection instanceof imagespace.collections.IqrImageCollection) {
            imagespace.searchView.collection.fetch(imagespace.searchView.collection.params || {}, true);
        } else {
            imagespace.smqtk.iqr.RefineView();
        }
    };

    /**
     * Anytime the page is changed, check if we're still in the middle of an
     * IQR session. If we are then make sure to update any refinement views if necessary,
     * otherwise clear any refinement notice that might exist from a previous session.
     **/
    imagespace.router.on('route', function (route, params) {
        if (route === 'search' && _.size(params) > 1 && params[1] &&
            params[1].indexOf('smqtk_iqr_session') !== -1) {
            if (!imagespace.smqtk.iqr.currentIqrSession) {
                girder.events.once('im:iqr-session-loaded', imagespace.smqtk.iqr.createOrUpdateRefineView);
            } else {
                imagespace.smqtk.iqr.createOrUpdateRefineView();
            }
        } else if (!_.has(imagespace.parseQueryString(), 'smqtk_iqr_session')) {
            imagespace.smqtk.iqr.currentIqrSession = false;
            imagespace.smqtk.iqr.refiningNotice(false);
        }
    });

    girder.wrap(imagespace.views.SearchView, 'render', function (render) {
        render.call(this);

        if (girder.currentUser !== null) {
            this.$('#search-controls .right-search-controls').append(girder.templates.startIqrSession({
                currentIqrSession: imagespace.smqtk.iqr.currentIqrSession
            }));

            this.$('#smqtk-iqr-quit-session').on('click', imagespace.smqtk.iqr.quitIqrSession);
        }

        if (imagespace.smqtk.iqr.currentIqrSession) {
            // Grid view is the only supported view for IQR, remove the view-mode controls
            this.$('.im-view-mode').remove();

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

            imagespace.smqtk.iqr.refiningNotice(true);
        }

        return this;
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
                smqtk_iqr_session: iqrSession.get('meta').sid
            });

            imagespace.smqtk.iqr.sessions.add(iqrSession);
            imagespace.smqtk.iqr.currentIqrSession = iqrSession;
            imagespace.searchView.render();
        }, this));
    };

    imagespace.views.SearchView.prototype.events['click #smqtk-iqr-load-session'] = function (event) {
        girder.restRequest({
            path: 'smqtk_iqr/session_folder'
        }).done(function (resp) {
            new imagespace.views.IqrSelectSessionView({
                el: $("#g-dialog-container"),
                parentView: imagespace.searchView,
                folder: new girder.models.FolderModel(resp)
            }).render();
        });
    };

    // Remove IQR sessions with no data (see docs above)
    girder.wrap(girder.views.ItemListWidget, 'render', function (render) {
        render.call(this);

        this.collection.models = _.filter(this.collection.models, function (model) {
            return model.has('meta') &&
                model.get('name') != model.get('meta').sid
        });

        return this;
    });

    girder.wrap(girder.views.EditItemWidget, 'render', function (render) {
        render.call(this);

        // Pretend the IQR session id doesn't exist for purposes of naming
        if ($('#g-name').val() == imagespace.smqtk.iqr.currentIqrSession.get('meta').sid) {
            $('#g-name').val('');
        }

        $('#g-name').focus();

        return this;
    });

    imagespace.views.SearchView.prototype.events['click #smqtk-iqr-refine'] = function (event) {
        var session = imagespace.smqtk.iqr.currentIqrSession;

        if (_.size(session.get('meta').pos_uuids) === 0) {
            alert('Refinement requires at least 1 positive example.');
            return;
        }

        $('button#smqtk-iqr-refine').append('    <i class="icon-spin5 animate-spin"></i>');

        girder.restRequest({
            path: 'smqtk_iqr/refine',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                sid: session.get('meta').sid,
                pos_uuids: session.get('meta').pos_uuids,
                neg_uuids: session.get('meta').neg_uuids
            })
        }).done(function () {
            imagespace.smqtk.iqr.createOrUpdateRefineView();
        }).error(console.error);
    };

    imagespace.views.SearchView.prototype.events['click #smqtk-iqr-save-session'] = function (event) {
        new girder.views.EditItemWidget({
            el: $('#g-dialog-container'),
            item: imagespace.smqtk.iqr.currentIqrSession,
            parentView: imagespace.searchView
        }).render();
    };
});
