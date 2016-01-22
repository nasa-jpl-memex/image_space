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
import os
import requests
import subprocess
from girder import constants
from girder.constants import SettingKey
from girder.utility.model_importer import ModelImporter
from .imagefeatures_rest import ImageFeatures
from .imagepivot_rest import ImagePivot
from .imagesearch_rest import ImageSearch
from .imageprefix_rest import ImagePrefix


class CustomAppRoot(object):
    """
    This serves the main index HTML file of the custom app from /
    """
    exposed = True

    indexHtml = None

    vars = {
        'apiRoot': 'api/v1',
        'staticRoot': 'static',
        'title': 'ImageSpace',
        'versionInfo': {
            'niceName': 'SUG v3.0',
            'sha': subprocess.check_output(
                ['git', 'rev-parse', '--short', 'HEAD'],
                cwd=os.path.dirname(os.path.realpath(__file__))
            ).strip()
        }
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
        % for plugin in pluginCss:
            % if plugin != 'imagespace':
        <link rel="stylesheet"
              href="${staticRoot}/built/plugins/${plugin}/plugin.min.css">
            % endif
        % endfor
        <link rel="stylesheet"
              href="${staticRoot}/built/plugins/imagespace/imagespace.min.css">
        <link rel="icon"
              type="image/png"
              href="${staticRoot}/img/Girder_Favicon.png">

        <style id="blur-style">
            img.im-blur {
                -webkit-filter: blur(10px);
                filter: blur(10px)
            }
        </style>

        <script type="text/javascript">
          imagespace = {};
          imagespace.versionInfo = ${versionInfo};
        </script>

      </head>
      <body>
        <div id="g-global-info-apiroot" class="hide">${apiRoot}</div>
        <div id="g-global-info-staticroot" class="hide">${staticRoot}</div>

        <script>
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-66442136-2', 'auto');
            ga('send', 'pageview');
        </script>

        <script src="${staticRoot}/built/libs.min.js"></script>
        <script src="${staticRoot}/built/app.min.js"></script>
        <script src="${staticRoot}/built/plugins/gravatar/plugin.min.js">
        </script>
        % for plugin in pluginJs:
           % if plugin != 'imagespace':
        <script src="${staticRoot}/built/plugins/${plugin}/plugin.min.js"></script>
           % endif
        % endfor
        <script src="${staticRoot}/built/plugins/imagespace/imagespace-libs.min.js">
        </script>
        <script src="${staticRoot}/built/plugins/imagespace/imagespace.min.js">
        </script>
        <script src="${staticRoot}/built/plugins/imagespace/main.min.js"></script>
      </body>
    </html>
    """

    def GET(self):
        self.vars['pluginCss'] = []
        self.vars['pluginJs'] = []
        builtDir = os.path.join(constants.STATIC_ROOT_DIR, 'clients', 'web',
                                'static', 'built', 'plugins')
        for plugin in ModelImporter.model('setting').get(
                SettingKey.PLUGINS_ENABLED):
            if os.path.exists(os.path.join(builtDir, plugin, 'plugin.min.css')):
                self.vars['pluginCss'].append(plugin)
            if os.path.exists(os.path.join(builtDir, plugin, 'plugin.min.js')):
                self.vars['pluginJs'].append(plugin)

        if self.indexHtml is None:
            self.indexHtml = mako.template.Template(self.template).render(
                **self.vars)

        return self.indexHtml


def load(info):
    required_env_vars = ('IMAGE_SPACE_SOLR',
                         'IMAGE_SPACE_PREFIX',
                         'IMAGE_SPACE_SOLR_PREFIX')

    for var in required_env_vars:
        if var not in os.environ or os.environ[var] == '':
            raise Exception('Imagespace will not function without the %s '
                            'environment variable.' % var)
        else:
            os.environ[var] = os.environ[var].rstrip('/')

    # Bind our REST resources
    info['apiRoot'].imagesearch = ImageSearch()
    info['apiRoot'].imagefeatures = ImageFeatures()
    info['apiRoot'].imagepivot = ImagePivot()
    info['apiRoot'].imageprefix = ImagePrefix()

    # Move girder app to /girder, serve our custom app from /
    info['serverRoot'], info['serverRoot'].girder = (CustomAppRoot(),
                                                     info['serverRoot'])
    info['serverRoot'].api = info['serverRoot'].girder.api


def solr_documents_from_paths(paths, classifications=None):
    """Given a list of paths, return list of relevant solr documents
    by uppercasing the basename of the paths.

    This performs several requests, each of size CHUNK_SIZE to avoid sending
    too much data (HTTP 413).

    Additionally it can take an iterable of classifications which will be
    searched for through Solr.

    :param paths: List of solr paths corresponding to the Solr id attribute
    :param classifications: List of classifications to search by
    :returns: List of solr documents
    """
    CHUNK_SIZE = 20
    documents = []

    for i in xrange(0, len(paths), CHUNK_SIZE):
        paths_chunk = paths[i:i + CHUNK_SIZE]

        if classifications:
            q = ' OR '.join(['%s:[.7 TO *]' % key
                             for key in classifications])
        else:
            q = '*:*'

        r = requests.get(os.environ['IMAGE_SPACE_SOLR'] + '/select', params={
            'wt': 'json',
            'q': q,
            'fq': ['mainType:image',
                   'resourcename_t_md:(%s)' %
                   ' '.join('%s' % os.path.basename(p).upper() for p in paths_chunk)],
            'rows': str(CHUNK_SIZE)
        }, verify=False)

        documents += r.json()['response']['docs']

    return documents
