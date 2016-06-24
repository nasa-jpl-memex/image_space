from girder.models.setting import Setting
from girder.plugins.imagespace.settings import ImageSpaceSetting

class FlannSetting(ImageSpaceSetting):
    requiredSettings = ('IMAGE_SPACE_FLANN_INDEX',)

    def validateImageSpaceFlannIndex(self, doc):
        return doc.rstrip('/')
