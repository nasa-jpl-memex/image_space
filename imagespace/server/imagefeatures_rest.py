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

import cherrypy
import requests
from tika import parser

class ImageFeatures(Resource):
    def __init__(self):
        self.resourceName = 'imagefeatures'
        self.route('POST', (), self.getImageFeatures)

    @access.public
    def getImageFeatures(self, params):
        try:
            import cv2
            import numpy as np
            cv2_available = True
        except ImportError:
            cv2_available = False

        # Disabling opencv for now
        cv2_available = False

        if 'url' in params:
            data = requests.get(params['url'], verify=False).content
        else:
            data = str(cherrypy.request.body.read())

        # Run Tika once
        parsed = parser.from_buffer(data)
        tika = {}
        for (k, v) in parsed["metadata"].iteritems():
            k = k.lower().replace(':', '_').replace(' ', '_').replace('-', '_')
            tika[k] = v[0] if type(v) is list and len(v) else v
        tika['content'] = parsed["content"]

        if cv2_available:
            file_bytes = np.asarray(bytearray(data), dtype=np.uint8)
            image = cv2.imdecode(file_bytes, flags=cv2.CV_LOAD_IMAGE_UNCHANGED);

            if image is not None:
                if len(image.shape) < 3 or image.shape[2] == 1:
                    image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)

                v = cv2.calcHist([image], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
                v = v.flatten()
                hist = v / sum(v)
                tika['histogram'] = hist.tolist()

        return tika
    getImageFeatures.description = (Description('Extracts image features')
        .param('body', 'The image content in the body of the request.',
               paramType='body'))
