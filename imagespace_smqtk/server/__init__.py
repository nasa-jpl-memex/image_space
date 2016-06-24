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
from .smqtk_search import SmqtkSimilaritySearch
from .smqtk_iqr import SmqtkIqr
from .smqtk import Smqtk
from .settings import SmqtkSetting

def load(info):
    smqtkSetting = SmqtkSetting()

    for setting in smqtkSetting.requiredSettings:
        smqtkSetting.get(setting)

    info['apiRoot'].smqtk_similaritysearch = SmqtkSimilaritySearch()
    info['apiRoot'].smqtk_iqr = SmqtkIqr()
    info['apiRoot'].smqtk = Smqtk()
