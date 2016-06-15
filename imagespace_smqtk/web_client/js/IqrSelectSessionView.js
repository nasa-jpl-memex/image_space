imagespace.views.IqrSelectSessionView = imagespace.View.extend({
    initialize: function (settings) {
        this.folder = settings.folder;
        this.hierarchyView = new girder.views.HierarchyWidget({
            parentView: this,
            parentModel: this.folder,
            showActions: false,
            checkboxes: false,
            onItemClick: function (item) {
                imagespace.smqtk.iqr.currentIqrSession = new imagespace.models.IqrSessionModel(item.attributes);

                imagespace.updateQueryParams({
                    smqtk_iqr_session: item.get('name')
                }, { trigger: true });

                $('.modal-header button[data-dismiss="modal"]').click()
            }
        });
        return this;
    },

    render: function () {
        this.$el.html(girder.templates.iqrSelectSession({})).girderModal(this);
        this.hierarchyView.setElement(this.$('.im-hierarchy-widget')).render();
        return this;
    }
});