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

from .cmu_search import CmuFullImageSearch, CmuImageBackgroundSearch


def load(info):
    required_env_vars = ('IMAGE_SPACE_CMU_BACKGROUND_SEARCH',
                         'IMAGE_SPACE_CMU_FULL_IMAGE_SEARCH',
                         'IMAGE_SPACE_CMU_PREFIX')

    for required_var in required_env_vars:
        if required_var not in os.environ \
           or os.environ[required_var] == '':
            raise Exception(
                'Imagespace CMU will not function without the %s environment '
                'variable.' % required_var)
        else:
            os.environ[required_var] = os.environ[required_var].rstrip('/')

    info['apiRoot'].cmu_imagebackgroundsearch = CmuImageBackgroundSearch()
    info['apiRoot'].cmu_fullimagesearch = CmuFullImageSearch()
