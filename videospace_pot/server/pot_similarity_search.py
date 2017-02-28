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
from girder.plugins.imagespace import ImageFeatures
from .settings import PoTSetting
from girder.plugins.imagespace import solr_documents_from_field

import json
import requests

import numpy as np

class PoTImageSimilaritySearch(Resource):
    def __init__(self):
        self.resourceName = 'pot_similarity_search'
        self.route('GET', (), self.getPoTSimilaritySearch)
        
        # Load matrix
        setting = PoTSetting()
        
        path_to_sim_mat = setting.get(setting.MATRIX_LOC_PROP)
        self.SOLR_ID_PREFIX = setting.get("IMAGE_SPACE_SOLR_PREFIX") + "/"
        
        print "Loading similarity matrix", path_to_sim_mat
        # List of all videos
        self.videos_to_idx = None
        self.videos_list = None
        with open(path_to_sim_mat) as f:
            self.videos_list = f.readline().strip().split(",")[1:]
            
            self.videos_to_idx = dict([(x,i) for i,x in enumerate(self.videos_list)])

        # load data from formatted_similarity_calc.csv
        # skip header
        # skip first column so usecols=range(1 , num_videos),
        # paint only upper half filling_values=0)
        self.data = np.genfromtxt(path_to_sim_mat,
                  delimiter=",", skip_header=1, usecols=range(1 , len(self.videos_list) + 1),
                  filling_values=0)
          
          
        ## add matrix with it's transpose to fill lower half  
        self.data = np.triu(self.data).T + np.triu(self.data)  
        ## Setting diagonal to 0 so video is not evaluated against itself 
        np.fill_diagonal(self.data, 0)


    @access.public
    def getPoTSimilaritySearch(self, params):
        return self._similarVideoSearch(params)
    getPoTSimilaritySearch.description = (
        Description('Searches for similar videos using PoT similarity')
        .param('url', 'URL of video file in solr index')
        .param('limit',
               'Number of videos to limit search to (defaults to 100)',
               required=False))

    def _similarVideoSearch(self, params):
                
        limit = params['limit'] if 'limit' in params else '100'
        limit = int(limit)
        
        video_url = params["url"].split("/")
        video_name = video_url[-1]
        
        if video_name not in self.videos_to_idx:
            print video_name, "Not found in computed matrix"
            return {
                'numFound': 0,
                'docs': []
            }
            
        video_idx = self.videos_to_idx[video_name]
        
        print video_name, video_idx
        
        #create copies of array so we don't disturb original array 
        sim_score_sort = 0 + self.data[video_idx]
        videos_sorted = [] + self.videos_list
        
        #sort with similar index
        sim_score_sort, videos_sorted = (list(x) for x in zip(*sorted(zip(sim_score_sort, videos_sorted))))
        # Pick videos from last 
        results = videos_sorted[-limit:]
        
        return {
                'numFound': len(results),
                'docs': solr_documents_from_field("id", [self.SOLR_ID_PREFIX + res_video_name for res_video_name in results ])
            }

