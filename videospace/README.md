# VidoSpace Server

VideoSpace is a plugin for exploring a video data set. Installation instructions are same as ImageSpace - https://github.com/memex-explorer/image_space/blob/master/imagespace/README.md

Below sections list specific commands for VideoSpace and it's plugins. Before continuing further it's highly suggested to read imagespace installation instructions. You need to install girder and required prerequisite as per https://github.com/memex-explorer/image_space/blob/master/imagespace/README.md#girder-with-imagespace-plugin 

### Commands to install VideoSpace and Video Similarity Plugins
  ```bash
girder-install plugin -s /path/to/image_space/videospace
girder-install plugin -s /path/to/image_space/videospace_tika
girder-install plugin -s /path/to/image_space/videospace_pot
```

### Environment variables for videospace
  ```bash
  export IMAGE_SPACE_SOLR=http://your_solr_server_rest_endpoint_OR_local_SolrCoreURLInstance
  export IMAGE_SPACE_SOLR_PREFIX=/server/path/to/image/dir
  export IMAGE_SPACE_PREFIX=http://path_to_image_repository_local_or_cloud
  
  #For similarity plugins
  export VIDEO_SPACE_POT_MATRIX=/path/to/hadoop-pot/formatted_output.txt
  export VIDEO_SPACE_SOLR_TIKA_SIM_FIELD="meta_sim_score"

```

### Start the Girder server 
  ```bash
  python -m girder
```

## License

Apache License v2
