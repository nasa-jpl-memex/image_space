from girder.models.setting import Setting

class ColumbiaSetting(Setting):
    requiredSettings = ('IMAGE_SPACE_COLUMBIA_INDEX',)

    def validateImageSpaceColumbiaIndex(self, doc):
        return doc.rstrip('/')
