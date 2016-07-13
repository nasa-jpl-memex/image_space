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
from .settings import ImageSpaceSetting


class ImagePrefix(Resource):
    def __init__(self):
        self.resourceName = 'imageprefix'
        self.route('GET', (), self.getImagePrefix)

    @access.public
    def getImagePrefix(self, params):
        setting = ImageSpaceSetting()

        return {
            'prefix': setting.get('IMAGE_SPACE_PREFIX'),
            'solrPrefix': setting.get('IMAGE_SPACE_SOLR_PREFIX'),
            'stolenCameraPrefix': setting.get('IMAGE_SPACE_STOLEN_CAMERA') or 'http://www.stolencamerafinder.com/search',
            'facetviewAdsUrl': setting.get('IMAGE_SPACE_FACETVIEW_ADS_URL'),
            'localBasicAuth': setting.get('IMAGE_SPACE_LOCAL_BASIC_AUTH'),
            'defaultSimilaritySearch': setting.get('IMAGE_SPACE_DEFAULT_SIMILARITY_SEARCH')
        }
    getImagePrefix.description = Description('Returns image URL prefix')
