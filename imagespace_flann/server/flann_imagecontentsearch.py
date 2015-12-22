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

from girder.plugins.imagespace import ImageFeatures

import json
import requests
import os


class FlannImageContentSearch(Resource):
    def __init__(self):
        self.resourceName = 'flann_imagecontentsearch'
        self.route('GET', (), self.getImageContentSearch)

    @access.public
    def getImageContentSearch(self, params):
        return self._imageContentSearch(params)
    getImageContentSearch.description = (
        Description('Performs FLANN content search')
        .param('url', 'Publicly accessible URL of the image to search')
        .param('limit',
               'Number of images to limit search to (defaults to 100)',
               required=False)
        .param('histogram', 'Color histogram to use', required=False))

    def _imageContentSearch(self, params):
        limit = params['limit'] if 'limit' in params else '100'

        if 'histogram' not in params:
            features = ImageFeatures()
            f = features.getImageFeatures({'url': params['url']})
            params['histogram'] = json.dumps(f['histogram'])

        logger.info(
            'Using FLANN INDEX at ' +
            os.environ['IMAGE_SPACE_FLANN_INDEX'])
        return requests.get(
            os.environ['IMAGE_SPACE_FLANN_INDEX'] +
            '?query=' + params['histogram'] +
            '&k=' + str(limit)).json()
