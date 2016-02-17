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

from girder import events
from girder.api import access
from girder.api.describe import Description
from girder.api.rest import Resource
from urlparse import urlparse

import itertools
import json
import requests
import os


class ImageSearch(Resource):
    def __init__(self):
        self.resourceName = 'imagesearch'
        self.route('GET', (), self.getImageSearch)
        self.route('GET', ('relevant_ads',), self.getRelevantAds)

    @access.public
    def getRelevantAds(self, params):
        AD_LIMIT = 20
        def sort_documents_by_url(documents):
            return sorted(documents, key=lambda x: x['url'])

        # @todo this assumes all URLs returned from Solr will properly urlparse
        def group_documents_by_domain(documents):
            return itertools.groupby(sort_documents_by_url(documents),
                                     lambda doc: urlparse(doc['url']).netloc)

        try:
            result = requests.get(os.environ['IMAGE_SPACE_SOLR'] + '/select', params={
                'wt': 'json',
                'q': 'outpaths:"%s"' % params['solr_image_id'],
                'fl': 'id,url',
                'rows': str(AD_LIMIT)
            }, verify=False).json()
        except ValueError:
            return {
                'numFound': 0,
                'docs': []
            }

        response = {
            'numFound': result['response']['numFound'],
            'docs': result['response']['docs'],
            'groupedDocs': []
        }

        for (domain, documents) in group_documents_by_domain(response['docs']):
            response['groupedDocs'].append([domain, list(documents)])

        # Display the domain with the largest number of documents first
        response['groupedDocs'] = sorted(response['groupedDocs'],
                                         key=lambda (_, docs): len(docs),
                                         reverse=True)

        return response
    getRelevantAds.description = Description(
        'Retrieve the relevant ad ids and urls from a given image'
    ).param('solr_image_id', 'ID of the Solr document representing an image')

    @access.public
    def getImageSearch(self, params):
        return self._imageSearch(params)

    @access.public
    def postImageSearch(self, params):
        return self._imageSearch(params)

    def _imageSearch(self, params):
        def filenameUpper(filename):
            path = filename.replace('file:', '')
            return 'file:%s' % os.path.join(os.path.dirname(path),
                                            os.path.basename(path).upper())

        limit = params['limit'] if 'limit' in params else '100'
        query = params['query'] if 'query' in params else '*:*'
        offset = params['offset'] if 'offset' in params else '0'
        classifications = json.loads(params['classifications']) if 'classifications' in params else []
        base = os.environ['IMAGE_SPACE_SOLR'] + '/select'

        if classifications:
            query += ' AND (%s)' % ' OR '.join(['%s:[.7 TO *]' % key
                                                for key in classifications])

        qparams = {
            'wt': 'json',
            'hl': 'true',
            'hl.fl': '*',
            'q': query,
            'start': offset,
            'rows': limit
        }

        # Give plugins a chance to adjust the Solr query parameters
        event = events.trigger('imagespace.imagesearch.qparams', qparams)

        for response in event.responses:
            qparams.update(response)

        try:
            result = requests.get(base, params=qparams, verify=False).json()
        except ValueError:
            return []

        for image in result['response']['docs']:
            image['highlight'] = result['highlighting'][image['id']]

        for doc in result['response']['docs']:
            doc['id'] = filenameUpper(doc['id'])

        response = {
            'numFound': result['response']['numFound'],
            'docs': result['response']['docs']
        }

        return response
    getImageSearch.description = Description('Searches image database')
    # @todo document params
