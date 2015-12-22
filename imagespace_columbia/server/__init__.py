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

from .columbia_imagecontentsearch import ColumbiaImageContentSearch


def load(info):
    index = 'IMAGE_SPACE_COLUMBIA_INDEX'
    if index not in os.environ \
       or os.environ[index] == '':
        raise Exception(
            'Imagespace Columbia will not function without the %s '
            'environment variable.' % index)
    else:
        os.environ[index] = os.environ[index].rstrip('/')

    info['apiRoot'].columbia_imagecontentsearch = ColumbiaImageContentSearch()
