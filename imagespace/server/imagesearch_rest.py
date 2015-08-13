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
from girder import logger

import requests
import os


class ImageSearch(Resource):
    def __init__(self):
        self.resourceName = 'imagesearch'
        self.route('GET', (), self.getImageSearch)

    @access.public
    def getImageSearch(self, params):
        return self._imageSearch(params)

    @access.public
    def postImageSearch(self, params):
        return self._imageSearch(params)

    def _imageSearch(self, params):
        limit = params['limit'] if 'limit' in params else '100'
        query = params['query'] if 'query' in params else '*'
        base = (
            os.environ['IMAGE_SPACE_SOLR'] +
            '/select?wt=json&indent=true&hl=true&hl.fl=*'
        )
        try:
            result = requests.get(
                base + '&q=' + query +
                '&rows=' + str(limit), verify=False).json()
        except ValueError:
            return []
        for image in result['response']['docs']:
            image['highlight'] = result['highlighting'][image['id']]
        return result['response']['docs']
    getImageSearch.description = Description('Searches image database')
