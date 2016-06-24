from girder.models.setting import Setting
from girder.plugins.imagespace.settings import ImageSpaceSetting

class GeorgetownSetting(ImageSpaceSetting):
    requiredSettings = ('IMAGE_SPACE_GEORGETOWN_DOMAIN_DYNAMICS_SEARCH',)

    def validateImageSpaceGeorgetownDomainDynamicsSearch(self, doc):
        return doc.rstrip('/')
