ImageSpace + Similarity Search + IQR Docker Setup
=================================================
This guide involves setting up 5 containers:   
1) ImageSpace Solr   
2) ImageSpace Mongo   
3) ImageSpace Girder   
4) SMQTK Postgres   
5) SMQTK Services   


ImageSpace Docker Setup
=======================
Follow the instructions [here](https://github.com/memex-explorer/image_space/blob/master/scripts/deploy/README.md) on how to setup ImageSpace and Solr.

Take note of the Docker network these get provisioned into, as the SMQTK containers need to be started on the same network.

The Docker network will be suffixed with "imagespace-network", the networks can listed using `docker network ls`.

SMQTK Docker Setup
==================
This step often takes longest, as SMQTK needs to compute descriptors for every image in your `IMAGE_DIR` before it can start serving requests.

Download, chmod, and run the bootstrapping script:
```
wget https://raw.githubusercontent.com/Kitware/SMQTK/master/docker/smqtk_services.run_images.sh
chmod u+x smqtk_services.run_images.sh
./smqtk_services.run_images.sh --docker-network DOCKER_NETWORK --images IMAGE_DIR
```

This should show the descriptors being generated and end with a message from Werkzeug stating that the web server is running.


Configuration
=============
Girder needs to know where it can reach SMQTK services, execute these commands on the Mongo container to enable the SMQTK plugin and set the settings:

```
docker exec -it MONGO_CONTAINER_NAME mongo girder --eval 'db.setting.update({key: "core.plugins_enabled"}, {$push: {value: "imagespace_smqtk"}})'
docker exec -it MONGO_CONTAINER_NAME mongo girder --eval 'db.setting.insert({key: "IMAGE_SPACE_SMQTK_NNSS_URL", value: "http://smqtk-services:12345"})'
docker exec -it MONGO_CONTAINER_NAME mongo girder --eval 'db.setting.insert({key: "IMAGE_SPACE_SMQTK_IQR_URL", value: "http://smqtk-services:12346"})'
docker exec -it MONGO_CONTAINER_NAME mongo girder --eval 'db.setting.insert({key: "IMAGE_SPACE_DEFAULT_SIMILARITY_SEARCH", value: "smqtk-similarity"})'
```

After setting these, Girder needs to be restarted, this can be done with:
```
docker exec -it GIRDER_CONTAINER_NAME touch /girder/girder/conf/girder.dist.cfg
```
