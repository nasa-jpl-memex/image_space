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
from girder.plugins.videospace import ImageFeatures
from .settings import TikaSimSetting
from girder.plugins.videospace import solr_documents_from_field

import json
import requests

import numpy as np

class TikaVideoSimilaritySearch(Resource):
    
    
    def __init__(self):
        self.resourceName = 'tika_similarity_search'
        self.route('GET', (), self.getTikaSimilaritySearch)
        
        setting = TikaSimSetting()
        self.SOLR_TIKA_SIM_FIELD = setting.get(setting.ENV_SOLR_TIKA_SIM_FIELD)
        self.SOLR_ID_PREFIX = setting.get("IMAGE_SPACE_SOLR_PREFIX") + "/"
        self.IMAGE_SPACE_SOLR = setting.get('IMAGE_SPACE_SOLR')

    @access.public
    def getTikaSimilaritySearch(self, params):
        return self._similarVideoSearch(params)
    getTikaSimilaritySearch.description = (
        Description('Searches for similar videos using Tika similarity')
        .param('url', 'URL of video file in solr index')
        .param('limit',
               'Number of videos to limit search to (defaults to 100)',
               required=False))

    def get_similar_doc_from_solr(self, score, limit, higher=True):
        '''
        returns a list of tuples similar doc. First element of tuple is proximity of that doc, and second element is id of that doc. 
        @param score: Score of current video
        @param limit: Number of documents to be returned from solr
        @param higher: To decide either search docs with similarity score greater than current or lower  
        '''
        q = ""
        sort = ""
        if higher:
            q = "[{0} TO 1.0]".format(score)
            sort = "asc"
        else:
            q = "[0 TO {0}]".format(score)
            sort = "desc"
            
        params = {
            'wt': 'json',
            'q': 'meta_sim_score:' + q,
            'sort': 'meta_sim_score ' + sort,
            'fl': 'id,score',
            'rows': limit,
        }
        
        r = requests.post(self.IMAGE_SPACE_SOLR + '/select',
                              data=params,
                              verify=False).json()
                              
        return [ (abs( float(x["score"]) - float(score) ), x["id"]) for x in r["response"]["docs"]]
        
                              
    def _similarVideoSearch(self, params):
                
        limit = params['limit'] if 'limit' in params else '100'
        limit = int(limit)
        
        video_url = params["url"].split("/")
        video_name = video_url[-1]
        
        score = params["score"]
        
        print video_name, score
        
        similar_docs = self.get_similar_doc_from_solr(score, limit, higher=True)
        similar_docs += self.get_similar_doc_from_solr(score, limit, higher=False)
        
        #Removing duplicates. They can be doc with exact same score which will appear in both higher and lower search
        similar_docs = list(set(similar_docs))
        
        similar_docs.sort()
        
        similar_docs = similar_docs[:limit]
        
        return {
                'numFound': len(similar_docs),
                'docs': solr_documents_from_field("id", [ x[1] for x in similar_docs ])
            }

