ImageSpace Docker Setup
=======================

Requirements
============
Docker >= 1.9   
[Docker Compose](https://docs.docker.com/compose/install/)

Setup
=====
Run the following command to bring up containers for Girder, Mongo, and Solr.
```
IMAGE_DIR=/my/image-dir docker-compose up -d
```

At this point, Solr needs to have records for each image in your IMAGE_DIR.
From the solr directory, run:
```
./import-images.sh SOLR-CONTAINER-NAME imagespace /my/image-dir
```

Navigating to [http://localhost:8989](http://localhost:8989) should result in a basic installation
of ImageSpace.
