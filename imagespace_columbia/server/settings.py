from girder.models.setting import Setting
from girder.plugins.imagespace.settings import ImageSpaceSetting

class ColumbiaSetting(ImageSpaceSetting):
    requiredSettings = ('IMAGE_SPACE_COLUMBIA_INDEX',)

    def validateImageSpaceColumbiaIndex(self, doc):
        return doc.rstrip('/')
