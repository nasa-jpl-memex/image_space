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

import os


class ImagePrefix(Resource):
    def __init__(self):
        self.resourceName = 'imageprefix'
        self.route('GET', (), self.getImagePrefix)

    @access.public
    def getImagePrefix(self, params):
        return {
            'prefix': os.environ['IMAGE_SPACE_PREFIX'],
            'solrPrefix': os.environ['IMAGE_SPACE_SOLR_PREFIX'],
            'stolenCameraPrefix': os.environ['IMAGE_SPACE_STOLEN_CAMERA'] if 'IMAGE_SPACE_STOLEN_CAMERA' in os.environ else 'http://www.stolencamerafinder.com/search',
            'facetviewAdsUrl': os.environ.get('IMAGE_SPACE_FACETVIEW_ADS_URL', False),
            'localBasicAuth': os.environ.get('IMAGE_SPACE_LOCAL_BASIC_AUTH', False)
        }
    getImagePrefix.description = Description('Returns image URL prefix')
