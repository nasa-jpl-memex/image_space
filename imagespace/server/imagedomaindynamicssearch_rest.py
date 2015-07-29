#!/usr/bin/env python
# -*- coding: utf-8 -*-

###############################################################################
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


class ImageDomainDynamicsSearch(Resource):
    def __init__(self):
        self.resourceName = 'imagedomaindynamicssearch'
        self.route('GET', (), self.getImageDomainDynamicsSearch)

    @access.public
    def getImageDomainDynamicsSearch(self, params):
        return self._imageDomainDynamicsSearch(params)

    @access.public
    def postImageDomainDynamicsSearch(self, params):
        return self._imageDomainDynamicsSearch(params)

    def _imageDomainDynamicsSearch(self, params):
        return [{'urls': d[0]} for d in requests.post(
            os.environ['IMAGE_SPACE_GEORGETOWN_DOMAIN_DYNAMICS_SEARCH'],
            data=params['feedback'],
            headers={
                'Content-type': 'text',
                'Content-length': str(len(params['feedback']))
            },
            verify=False)
            .json()]
    getImageDomainDynamicsSearch.description = Description('Searches images by domain dynamics')
