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

import mako
from .imagefeatures_rest import ImageFeatures
from .imagepivot_rest import ImagePivot
from .imagesearch_rest import ImageSearch


class CustomAppRoot(object):
    """
    This serves the main index HTML file of the custom app from /
    """
    exposed = True

    indexHtml = None

    vars = {
        'apiRoot': 'api/v1',
        'staticRoot': 'static',
        'title': 'Image Space 2'
    }

    template = r"""
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>${title}</title>
        <link rel="stylesheet"
              href="//fonts.googleapis.com/css?family=Droid+Sans:400,700">
        <link rel="stylesheet"
              href="${staticRoot}/lib/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet"
              href="${staticRoot}/lib/fontello/css/fontello.css">
        <link rel="stylesheet"
              href="${staticRoot}/lib/fontello/css/animation.css">
        <link rel="stylesheet"
              href="${staticRoot}/built/app.min.css">
        <link rel="stylesheet"
              href="${staticRoot}/built/plugins/imagespace/imagespace.min.css">
        <link rel="icon"
              type="image/png"
              href="${staticRoot}/img/Girder_Favicon.png">

      </head>
      <body>
        <div id="g-global-info-apiroot" class="hide">${apiRoot}</div>
        <div id="g-global-info-staticroot" class="hide">${staticRoot}</div>


        <script src="http://trifacta.github.io/vega/lib/d3.v3.min.js"></script>
        <script src="http://trifacta.github.io/vega/lib/d3.geo.projection.min.js"></script>
        <script src="http://trifacta.github.io/vega/lib/topojson.js"></script>
        <script src="http://trifacta.github.io/vega/vega.js"></script>


        <script src="${staticRoot}/built/libs.min.js"></script>
        <script src="${staticRoot}/built/app.min.js"></script>
        <script src="${staticRoot}/built/plugins/gravatar/plugin.min.js">
        </script>
        <script src="${staticRoot}/built/plugins/imagespace/imagespace.min.js">
        </script>
        <script src="${staticRoot}/built/plugins/imagespace/main.min.js"></script>
      </body>
    </html>
    """

    def GET(self):
        if self.indexHtml is None:
            self.indexHtml = mako.template.Template(self.template).render(
                **self.vars)

        return self.indexHtml


def load(info):
    # Bind our REST resources
    info['apiRoot'].imagesearch = ImageSearch()
    info['apiRoot'].imagefeatures = ImageFeatures()
    info['apiRoot'].imagepivot = ImagePivot()

    # Move girder app to /girder, serve our custom app from /
    info['serverRoot'], info['serverRoot'].girder = (CustomAppRoot(),
                                                     info['serverRoot'])
    info['serverRoot'].api = info['serverRoot'].girder.api
