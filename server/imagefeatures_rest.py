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


import json
import requests
import subprocess
import os
from StringIO import StringIO
import cv2

try:
    import Image
except ImportError:
    from PIL import Image

import numpy as np

from json import JSONDecoder
from functools import partial

# Capable of reading multi-record JSON files by yielding each
# parsed JSON record
def json_parse(fileobj, decoder=JSONDecoder(), buffersize=2048):
    buffer = ''
    for chunk in iter(partial(fileobj.read, buffersize), ''):
         buffer += chunk
         while buffer:
             try:
                 result, index = decoder.raw_decode(buffer)
                 yield result
                 buffer = buffer[index:]
             except ValueError:
                 # Not enough data to decode, read more
                 break


class ImageFeatures(Resource):
    def __init__(self):
        self.resourceName = 'imagefeatures'
        self.route('POST', (), self.getImageFeatures)

    @access.public
    def getImageFeatures(self, params):
        if 'url' in params:
            data = requests.get(params['url']).content
        else:
            data = str(cherrypy.request.body.read())

        print "data:"
        print data

        # Run Tika metadata
        cmd = ['java', '-jar', os.environ['IMAGE_SPACE_TIKA'], '-j']
        p = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.PIPE
        )
        out, err = p.communicate(data)

        print "out:"
        print out

        print "err:"
        print err

        tika_attributes = [d for d in json_parse(StringIO(out))][-1]
        tika = {}
        for (k, v) in tika_attributes.iteritems():
            k = k.lower().replace(':', '_').replace(' ', '_').replace('-', '_')
            tika[k] = v

        # Run Tika text extraction
        cmd = ['java', '-jar', os.environ['IMAGE_SPACE_TIKA'], '-t']
        p = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.PIPE
        )
        out, err = p.communicate(data)

        tika['content'] = out

        # image = Image.open(StringIO(data))
        # if len(image.split()) == 4:
        #     # prevent IOError: cannot write mode RGBA as BMP
        #     r, g, b, a = image.split()
        #     image = Image.merge("RGB", (r, g, b))

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
