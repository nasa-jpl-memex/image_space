from girder.models.setting import Setting

class FlannSetting(Setting):
    requiredSettings = ('IMAGE_SPACE_FLANN_INDEX',)

    def validateImageSpaceFlannIndex(self, doc):
        return doc.rstrip('/')
