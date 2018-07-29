docker exec -it deploy_imagespace-mongo_1 mongo girder --eval 'db.setting.update({key: "core.plugins_enabled"}, {$push: {value: "imagespace_smqtk"}})'
docker exec -it deploy_imagespace-mongo_1 mongo girder --eval 'db.setting.insert({key: "IMAGE_SPACE_SMQTK_NNSS_URL", value: "http://smqtk-services:12345"})'
docker exec -it deploy_imagespace-mongo_1 mongo girder --eval 'db.setting.insert({key: "IMAGE_SPACE_SMQTK_IQR_URL", value: "http://smqtk-services:12346"})'
docker exec -it deploy_imagespace-mongo_1 mongo girder --eval 'db.setting.insert({key: "IMAGE_SPACE_DEFAULT_SIMILARITY_SEARCH", value: "smqtk-similarity"})'
docker exec -it deploy_imagespace-girder_1 touch /girder/girder/conf/girder.dist.cfg
