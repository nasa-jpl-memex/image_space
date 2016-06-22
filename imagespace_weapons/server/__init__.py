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
import itertools
import os
import requests

from girder import events
from girder.api import access
from girder.api.describe import Description
from girder.api.rest import Resource
from girder.plugins.imagespace.settings import ImageSpaceSetting
from urlparse import urlparse


setting = ImageSpaceSetting()

def adjust_qparams_for_subtype(event):
    """
    SMQTK only works on png/jpeg/tiff as of now, so limit the results
    to those to avoid confusion when using IQR.
    """
    if 'fq' not in event.info:
        event.info['fq'] = []

    event.info['fq'].append('subType:("png" OR "jpeg" OR "tiff")')
    event.addResponse(event.info)

def add_maintype_to_qparams(event):
    if 'fq' not in event.info:
        event.info['fq'] = []

    event.info['fq'].append('mainType:image')
    event.addResponse(event.info)

def uppercase_basename_for_resourcenames(event):
    """
    Certain searches were indexed before conversion of the Solr index, so they pass
    values with lowercase resourcenames that actually correspond to the uppercase resource
    name versions.
    """
    if event.info['field'] == 'resourcename_t_md':
        event.info['values'] = [os.path.basename(x).upper() for x in
                                event.info['values']]
        event.addResponse(event.info)

def uppercase_result_filenames(event):
    def filenameUpper(filename):
        path = filename.replace('file:', '')
        return 'file:%s' % os.path.join(os.path.dirname(path),
                                        os.path.basename(path).upper())

    for doc in event.info['docs']:
        doc['id'] = filenameUpper(doc['id'])

    event.addResponse(event.info)


class WeaponsSearch(Resource):
    def __init__(self):
        self.resourceName = 'weaponssearch'
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
            result = requests.get(setting.get('IMAGE_SPACE_SOLR') + '/select', params={
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

        try:
            response = {
                'numFound': result['response']['numFound'],
                'docs': result['response']['docs'],
                'groupedDocs': []
            }
        except KeyError:
            return {
                'numFound': 0,
                'docs': []
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


def load(info):
    events.bind('imagespace.imagesearch.qparams',
                'adjust_qparams_for_maintype',
                add_maintype_to_qparams)

    events.bind('imagespace.imagesearch.qparams',
                'adjust_qparams_for_subtype',
                adjust_qparams_for_subtype)

    events.bind('imagespace.solr_documents_from_field',
                'upperbase_basename_for_resourcenames',
                uppercase_basename_for_resourcenames)

    info['apiRoot'].weaponssearch = WeaponsSearch()
