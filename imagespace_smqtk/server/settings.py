from girder.models.setting import Setting
from girder.plugins.imagespace.settings import ImageSpaceSetting

class SmqtkSetting(ImageSpaceSetting):
    requiredSettings = ('IMAGE_SPACE_SMQTK_NNSS_URL',
                        'IMAGE_SPACE_SMQTK_IQR_URL')

    def validateImageSpaceSmqtkSimilaritySearch(self, doc):
        return doc.rstrip('/')

    def validateImageSpaceSmqtkIqrUrl(self, doc):
        return doc.rstrip('/')

    def validateImageSpaceSmqtkNnssUrl(self, doc):
        return doc.rstrip('/')
