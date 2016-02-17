#!/usr/bin/env python
# -*- coding: utf-8 -*-

###############################################################################
#  Copyright Kitware Inc.
#
#  Licensed under the Apache License, Version 2.0 ( the "License" );
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
###############################################################################

from girder.api import access
from girder.api.describe import Description
from girder.api.rest import Resource
from girder.models import getDbConnection
from girder.plugins.imagespace import solr_documents_from_paths

import json
import requests
import os

DEFAULT_PAGE_SIZE = 100
NEAR_DUPLICATES_THRESHOLD = -1500  # Maximum distance to be considered a near duplicate

class SmqtkSimilaritySearch(Resource):
    def __init__(self):
        self.search_url = os.environ['IMAGE_SPACE_SMQTK_SIMILARITY_SEARCH']
        self.resourceName = 'smqtk_similaritysearch'
        self.route('GET', (), self.runImageSimilaritySearch)

    @access.public
    def runImageSimilaritySearch(self, params):
        assert hasattr(self, 'search_url')
        classifications = json.loads(params['classifications']) if 'classifications' in params else []
        params['n'] = params['n'] if 'n' in params else str(DEFAULT_PAGE_SIZE)
        smqtk_r = requests.get(self.search_url + '/n=' + params['n'] + '/' + params['url']).json()
        neighbors_to_distances = dict(zip(smqtk_r['neighbors'], smqtk_r['distances']))

        db = getDbConnection().get_default_database()
        mapped_paths = db[os.environ['IMAGE_SPACE_SMQTK_MAP_COLLECTION']].find({
            'sha': {
                '$in': smqtk_r['neighbors']
            }
        })
        solr_id_to_shas = {os.environ['IMAGE_SPACE_SOLR_PREFIX'] + '/' + x['path']: x['sha'] for x in mapped_paths}
        documents = solr_documents_from_paths(solr_id_to_shas.keys(), classifications)

        for document in documents:
            document['im_distance'] = neighbors_to_distances[solr_id_to_shas[document['id']]]

        if 'near_duplicates' in params and int(params['near_duplicates']) == 1:
            documents = [x for x in documents if x['im_distance'] <= NEAR_DUPLICATES_THRESHOLD]

        return {
            'numFound': len(documents),
            'docs': documents
        }
    runImageSimilaritySearch.description = (
        Description('Performs SMQTK background search')
        .param('n', 'Number of nearest neighbors to return', default=str(DEFAULT_PAGE_SIZE))
        .param('url', 'Publicly accessible URL of the image to search')
        .param('near_duplicates', 'Set to 1 to return only near duplicates'))
