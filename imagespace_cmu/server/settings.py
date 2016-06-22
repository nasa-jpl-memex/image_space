from girder.models.setting import Setting

class CmuSetting(Setting):
    requiredSettings = ('IMAGE_SPACE_CMU_PREFIX',
                        'IMAGE_SPACE_CMU_BACKGROUND_SEARCH',
                        'IMAGE_SPACE_CMU_FULL_IMAGE_SEARCH')

    def validateImageSpaceCmuPrefix(self, doc):
        return doc.rstrip('/')

    def validateImageSpaceCmuBackgroundSearch(self, doc):
        return doc.rstrip('/')

    def validateImageSpaceCmuFullImageSearch(self, doc):
        return doc.rstrip('/')
