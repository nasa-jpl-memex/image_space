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

import json
import requests
import os

from .imagefeatures_rest import ImageFeatures


class ImageContentSearch(Resource):
    def __init__(self):
        self.resourceName = 'imagesearch'
        self.route('GET', (), self.getImageContentSearch)

    @access.public
    def getImageContentSearch(self, params):
        return self._imageContentSearch(params)

    @access.public
    def postImageContentSearch(self, params):
        return self._imageContentSearch(params)

    def _imageContentSearch(self, params):
        limit = params['limit'] if 'limit' in params else '100'

        # Use FLANN index if env variable set
        if 'IMAGE_SPACE_FLANN_INDEX' in os.environ:
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

        # Use Columbia index
        logger.info(
            'Using COLUMBIA INDEX at ' +
            os.environ['IMAGE_SPACE_COLUMBIA_INDEX'] +
            '?url=' + params['url'] +
            '&num=' + str(limit))
        return [{'id': d} for d in requests.get(
            os.environ['IMAGE_SPACE_COLUMBIA_INDEX'] +
            '?url=' + params['url'] +
            '&num=' + str(limit),
            verify=False
        ).json()['images'][0]['similar_images']['cached_image_urls']]

    getImageContentSearch.description = Description('Searches image database')
