from girder.utility.model_importer import ModelImporter
from girder.api.rest import getCurrentUser, filtermodel

import base64
import requests

@filtermodel(model='folder')
def getCreateSessionsFolder():
    user = getCurrentUser()
    folder = ModelImporter.model('folder')

    # @todo Assumes a Private folder will always exist/be accessible
    privateFolder = list(folder.childFolders(parentType='user',
                                             parent=user,
                                             user=user,
                                             filters={
                                                 'name': 'Private'
                                             }))[0]

    return folder.createFolder(privateFolder, 'iqr_sessions', reuseExisting=True)


def base64FromUrl(url):
    r = requests.get(url)
    return (base64.b64encode(r.content), r.headers['Content-Type'])
