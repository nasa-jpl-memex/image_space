# Docker image: kitware/imagespace
# This spins up an install of ImageSpace based on the Girder Docker image.

# Requirements:
# - Directory of images to mount for serving (at IMAGE_SPACE_IMAGE_DIR)
# - Solr instance with URL to core as IMAGE_SPACE_SOLR
# - Mongo instances for Girder database
FROM girder/girder
MAINTAINER https://github.com/memex-explorer/image_space

EXPOSE 8080

RUN apt-get update && apt-get install --yes openjdk-7-jre

RUN git clone https://github.com/memex-explorer/image_space.git
RUN girder-install plugin -s image_space/imagespace*

RUN npm install --only=prod --unsafe-perm

ENV IMAGE_SPACE_SOLR=http://imagespace-solr:8983/solr/imagespace
ENV IMAGE_SPACE_SOLR_PREFIX=/images
ENV IMAGE_SPACE_PREFIX=http://localhost:8080/images
ENV IMAGE_SPACE_IMAGE_DIR=/images

ADD bootstrap-imagespace.py /
ADD imagespace-entrypoint.sh /
RUN mkdir /assetstore

ENTRYPOINT ["/imagespace-entrypoint.sh"]
