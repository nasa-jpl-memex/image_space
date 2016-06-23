from girder.models.setting import Setting

class GeorgetownSetting(Setting):
    requiredSettings = ('IMAGE_SPACE_GEORGETOWN_DOMAIN_DYNAMICS_SEARCH',)

    def validateImageSpaceGeorgetownDomainDynamicsSearch(self, doc):
        return doc.rstrip('/')
