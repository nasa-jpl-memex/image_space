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
import os
from girder import events


def add_maintype_to_qparams(event):
    event.info['fq'] = ['mainType:image']
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


def load(info):
    events.bind('imagespace.imagesearch.qparams',
                'adjust_qparams_for_maintype',
                add_maintype_to_qparams)

    events.bind('imagespace.solr_documents_from_field',
                'upperbase_basename_for_resourcenames',
                uppercase_basename_for_resourcenames)
