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
from .smqtk_search import SmqtkSimilaritySearch
from .smqtk_iqr import SmqtkIqr


def adjust_qparams_for_subtype(event):
    """
    SMQTK only works on png/jpeg/tiff as of now, so limit the results
    to those to avoid confusion when using IQR.
    """
    if 'fq' not in event.info:
        event.info['fq'] = []

    event.info['fq'].append('subType:("png" OR "jpeg" OR "tiff")')
    event.addResponse(event.info)


def load(info):
    required_env_vars = ('IMAGE_SPACE_SMQTK_SIMILARITY_SEARCH',
                         'IMAGE_SPACE_SMQTK_IQR_URL',)

    for required_var in required_env_vars:
        if required_var not in os.environ \
           or os.environ[required_var] == '':
            raise Exception(
                'Imagespace SMQTK will not function without the %s environment '
                'variable.' % required_var)
        else:
            os.environ[required_var] = os.environ[required_var].rstrip('/')

    info['apiRoot'].smqtk_similaritysearch = SmqtkSimilaritySearch()
    info['apiRoot'].smqtk_iqr = SmqtkIqr()

    events.bind('imagespace.imagesearch.qparams',
                'adjust_qparams_for_subtype',
                adjust_qparams_for_subtype)
