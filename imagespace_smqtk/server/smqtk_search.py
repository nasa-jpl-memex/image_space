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

import requests
import os


class SmqtkSimilaritySearch(Resource):
    def __init__(self):
        self.search_url = os.environ['IMAGE_SPACE_SMQTK_SIMILARITY_SEARCH']
        self.resourceName = 'smqtk_similaritysearch'
        self.route('GET', (), self.runImageSimilaritySearch)

    @access.public
    def runImageSimilaritySearch(self, params):
        assert hasattr(self, 'search_url')
        print self.search_url
        print params['url']
        r = requests.get(self.search_url+'/'+params['url']).json()

        return r
    runImageSimilaritySearch.description = (
        Description('Performs SMQTK background search')
        .param('url', 'Publicly accessible URL of the image to search'))
