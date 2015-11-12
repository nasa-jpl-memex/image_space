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
import os, json


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
        
        filename = params['url'].split('/')[-2] + "/" + params['url'].split('/')[-1]#, comes before

        # user chooses Image to perform Domain Specific search
        # query Solr for Image "id" of Image chosen by user
        # use Solr Response returned to reRank Images based on "chosen metadata fields"
        # display reRanked images

        req1 = requests.get(os.environ["IMAGE_SPACE_SOLR"] + "/select?q=" +filename+"&wt=json&rows=100")        

        jdata = {"docpath": "response/docs", "fields": json.dumps(["title", "content"]), "results": json.dumps(req1.json())}

        return requests.post(os.environ['IMAGE_SPACE_GEORGETOWN_DOMAIN_DYNAMICS_SEARCH'], data=jdata).json()["response"]["docs"]

        # since its a rest service , it has to be returned in JSON, facepalm!

        
    getImageDomainDynamicsSearch.description = Description('Searches images by domain dynamics')
