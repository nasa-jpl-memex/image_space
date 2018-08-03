# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# Docker image: memexexplorer/image_space
# This spins up an install of ImageSpace based on the Girder Docker image.
#
# Requirements:
# - Directory of images to mount for serving (at IMAGE_SPACE_IMAGE_DIR)
# - Solr instance with URL to core as IMAGE_SPACE_SOLR
# - Mongo instances for Girder database
FROM girder/girder:v1.7.1
MAINTAINER Chris Mattmann <chris.a.mattmann@jpl.nasa.gov>

EXPOSE 8080

RUN apt-get update && apt-get install --yes openjdk-7-jre netcat

RUN git clone https://github.com/memex-explorer/image_space.git
RUN girder-install plugin -s image_space/imagespace*

RUN npm install --only=prod --unsafe-perm

# Uncomment this if you just want to use the prepackaged Solr.
# ENV IMAGE_SPACE_SOLR=http://imagespace-solr:8983/solr/imagespace

ENV IMAGE_SPACE_SOLR=http://imagespace-imagecat:8081/solr/imagecatdev
ENV IMAGE_SPACE_SOLR_PREFIX=/images
ENV IMAGE_SPACE_PREFIX=http://localhost:8989/images
ENV IMAGE_SPACE_IMAGE_DIR=/images

ADD bootstrap-imagespace.py /
ADD imagespace-entrypoint.sh /
RUN mkdir /assetstore

ENTRYPOINT ["/imagespace-entrypoint.sh"]
