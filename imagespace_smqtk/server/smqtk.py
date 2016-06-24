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

from girder import logger
from girder.api import access
from girder.api.describe import Description, describeRoute
from girder.api.rest import Resource
from girder.models.model_base import GirderException

from .settings import SmqtkSetting
from .utils import base64FromUrl

import requests


class Smqtk(Resource):
    def __init__(self):
        setting = SmqtkSetting()
        self.search_url = setting.get('IMAGE_SPACE_SMQTK_NNSS_URL')
        self.resourceName = 'smqtk'
        self.route('POST', ('compute',), self.computeDescriptor)

    @access.user
    @describeRoute(
        Description('Compute the descriptor for a given image.')
        .param('url', 'URL of image to compute descriptor of')
        .errorResponse('Failed to compute descriptor.', 500)
    )
    def computeDescriptor(self, params):
        # @todo Naively assuming we will always be able to retrieve the URL
        image, _type = base64FromUrl(params['url'])
        r = requests.post('%(base_url)s/compute/base64://%(image)s?content_type=%(type)s' % {
            'base_url': self.search_url,
            'image': image,
            'type': _type})

        if not r.ok:
            logger.error('Failed to compute SMQTK descriptor for image %s.' % params['url'])
            raise GirderException('Failed to compute descriptor',
                                  'girder.plugins.imagespace_smqtk.smqtk.computeDescriptor')
        else:
            return r.json()
