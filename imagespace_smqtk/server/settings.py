from girder.models.setting import Setting

class SmqtkSetting(Setting):
    requiredSettings = ('IMAGE_SPACE_SMQTK_SIMILARITY_SEARCH',
                        'IMAGE_SPACE_SMQTK_IQR_URL',)

    def validateImageSpaceSmqtkSimilaritySearch(self, doc):
        return doc.rstrip('/')

    def validateImageSpaceSmqtkIqrUrl(self, doc):
        return doc.rstrip('/')
