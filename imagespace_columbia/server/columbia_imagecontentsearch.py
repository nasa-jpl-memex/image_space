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

from .settings import ColumbiaSetting

import requests


class ColumbiaImageContentSearch(Resource):
    def __init__(self):
        self.resourceName = 'columbia_imagecontentsearch'
        self.route('GET', (), self.getImageContentSearch)

    @access.public
    def getImageContentSearch(self, params):
        return self._imageContentSearch(params)
    getImageContentSearch.description = (
        Description('Searches columbia image database')
        .param('url', 'Publicly accessible URL of the image to search'))

    def _imageContentSearch(self, params):
        setting = ColumbiaSetting()
        limit = params['limit'] if 'limit' in params else '100'

        logger.info(
            'Using COLUMBIA INDEX at ' +
            setting.get('IMAGE_SPACE_COLUMBIA_INDEX') +
            '?url=' + params['url'] +
            '&num=' + str(limit))
        return [{'id': d} for d in requests.get(
            setting.get('IMAGE_SPACE_COLUMBIA_INDEX') +
            '?url=' + params['url'] +
            '&num=' + str(limit),
            verify=False
        ).json()['images'][0]['similar_images']['cached_image_urls']]
