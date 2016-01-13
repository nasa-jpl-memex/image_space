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

from girder.plugins.imagespace import solr_documents_from_paths

import json
import requests
import os


class CmuSearch(Resource):
    def _search(self, params):
        assert hasattr(self, 'search_url')

        classifications = json.loads(params['classifications']) if 'classifications' in params else []
        cmu_images = requests.post(self.search_url,
                                   data=params['url'],
                                   headers={
                                       'Content-type': 'text',
                                       'Content-length': str(len(params['url']))
                                   },
                                   verify=False).json()

        cmu_images = [[image.replace(os.environ['IMAGE_SPACE_CMU_PREFIX'],
                                     os.environ['IMAGE_SPACE_SOLR_PREFIX']), score]
                      for (image, score) in cmu_images]
        cmu_scores = {image.lower(): score for image, score in cmu_images}

        documents = solr_documents_from_paths([x[0] for x in cmu_images], classifications)

        # Augment original scores from response into solr documents
        for document in documents:
            document['im_score'] = cmu_scores[document['id'].lower()]

        return {
            'numFound': len(documents),
            'docs': documents
        }


class CmuImageBackgroundSearch(CmuSearch):
    def __init__(self):
        self.search_url = os.environ['IMAGE_SPACE_CMU_BACKGROUND_SEARCH']
        self.resourceName = 'cmu_imagebackgroundsearch'
        self.route('GET', (), self.getImageBackgroundSearch)

    @access.public
    def getImageBackgroundSearch(self, params):
        return self._search(params)
    getImageBackgroundSearch.description = (
        Description('Performs CMU background search')
        .param('url', 'Publicly accessible URL of the image to search'))


class CmuFullImageSearch(CmuSearch):
    def __init__(self):
        self.search_url = os.environ['IMAGE_SPACE_CMU_FULL_IMAGE_SEARCH']
        self.resourceName = 'cmu_fullimagesearch'
        self.route('GET', (), self.getFullImageSearch)

    @access.public
    def getFullImageSearch(self, params):
        return self._search(params)
    getFullImageSearch.description = (
        Description('Performs CMU full image search')
        .param('url', 'Publicly accessible URL of the image to search'))
