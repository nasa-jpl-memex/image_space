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

import json
import requests
import os


class GeorgetownImageDomainDynamicsSearch(Resource):
    def __init__(self):
        self.resourceName = 'georgetown_imagedomaindynamicssearch'
        self.route('GET', (), self.getGeorgetownImageDomainDynamicsSearch)

    @access.public
    def getGeorgetownImageDomainDynamicsSearch(self, params):
        return self._imageDomainDynamicsSearch(params)
    getGeorgetownImageDomainDynamicsSearch.description = (
        Description('Performs Georgetown domain dynamics search')
        .param('url', 'Publicly accessible URL of the image to search'))

    def _imageDomainDynamicsSearch(self, params):
        # , comes before
        filename = params['url'].split('/')[-2] + "/" + params['url'].split('/')[-1]

        # user chooses Image to perform Domain Specific search
        # query Solr for Image "id" of Image chosen by user
        # use Solr Response returned to reRank Images based on "chosen metadata fields"
        # display reRanked images

        req1 = requests.get(os.environ["IMAGE_SPACE_SOLR"] + "/select?q=" +filename+"&wt=json&rows=100")

        justJson = req1.json()["response"]["docs"]

        union_feature_names = set(justJson.pop().keys()) #returns rightmost element efficient for list

        for eachDoc in justJson:
            union_feature_names &= set(eachDoc.keys())

        jdata = {"docpath": "response/docs",
                 "fields": json.dumps(list(union_feature_names)),
                 "results": json.dumps(req1.json())}

        return requests.post(os.environ['IMAGE_SPACE_GEORGETOWN_DOMAIN_DYNAMICS_SEARCH'], data=jdata).json()["response"]["docs"]
