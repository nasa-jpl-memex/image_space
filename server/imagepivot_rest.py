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

class ImagePivot(Resource):
    def __init__(self):
        self.resourceName = 'imagepivot'
        self.route('GET', (), self.getImagePivot)


    @access.public
    def getImagePivot(self, params):
        pivot = params['pivot'] if 'pivot' in params else 'tiff_imagelength,tiff_imagewidth'
        query = params['query'] if 'query' in params else '*'
        base = os.environ['IMAGE_SPACE_SOLR'] + '/select?wt=json&indent=true'
        url = base + '&q=' + query + '&rows=1&facet=on&facet.pivot=' + pivot
        result = requests.get(url, verify=False).json()
        return result['facet_counts']['facet_pivot'][pivot]
    getImagePivot.description = Description('Performs pivot aggregation on image database')
