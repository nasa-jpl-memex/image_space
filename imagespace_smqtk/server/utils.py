from girder.utility.model_importer import ModelImporter
from girder.api.rest import getCurrentUser, filtermodel


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
