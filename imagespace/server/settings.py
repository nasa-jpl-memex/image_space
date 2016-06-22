import os

from girder.models.setting import Setting


class ImageSpaceSetting(Setting):
    requiredSettings = ('IMAGE_SPACE_SOLR',
                        'IMAGE_SPACE_PREFIX',
                        'IMAGE_SPACE_SOLR_PREFIX')

    def validateImageSpaceSolr(self, doc):
        return doc.rstrip('/')

    def validateImageSpaceSolrPrefix(self, doc):
        return doc.rstrip('/')

    def validateImageSpacePrefix(self, doc):
        return doc.rstrip('/')

    def get(self, key):
        storedSetting = super(ImageSpaceSetting, self).get(key)

        if os.environ.get(key, '') != '':
            return os.environ.get(key)
        elif storedSetting is not None:
            return storedSetting
        elif key in self.requiredSettings:
            raise Exception('ImageSpace will not function without the %s setting.' % key)
        else:
            return False
