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


# import exifread
import json
import requests
import subprocess
import os
from StringIO import StringIO

try:
    import Image
except ImportError:
    from PIL import Image
# import pytesseract

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
        data = cherrypy.request.body.read()

        # Run Tika
        cmd = ['java', '-jar', os.environ['IMAGE_SPACE_TIKA'], '-j']
        p = subprocess.Popen(cmd, stdout=subprocess.PIPE,
                                  stderr=subprocess.PIPE,
                                  stdin=subprocess.PIPE)
        out, err = p.communicate(data)

        tika_attributes = [data for data in json_parse(StringIO(out))][1]

        # img = Image.open(StringIO(data))
        # if len(img.split()) == 4:
        #     # prevent IOError: cannot write mode RGBA as BMP
        #     r, g, b, a = img.split()
        #     img = Image.merge("RGB", (r, g, b))

        return {
            'tika': tika_attributes
        }
    getImageFeatures.description = (Description('Extracts image features')
        .param('body', 'The image content in the body of the request.',
               paramType='body'))
