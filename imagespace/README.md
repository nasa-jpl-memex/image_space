# ImageSpace Server

ImageSpace is a plugin for [Girder](https://girder.readthedocs.org/en/latest/).

There are three processes involved for this app: a MongoDB server,
an image similarity server, 
and a Girder web server containing the imagespace plugin.

Note: Please upgrade to latest snapshot of Girder to resolve ImageSpace deployment issues

- Comprehensive Deploy
  * Follow below steps
- Easy Deploy, skips local indexing of documents
  * Follow below steps but **skip** setting up [Image similarity server](#imageSim)


## Pre-requisites and Install

### <a name="imageSim"></a>Image similarity server

The image similarity server requires a set of images to load and process into the index.
The server will look at the file located in the `IMAGE_SPACE_LISTS` environment variable.
An example lists file is here:
```
image_space/flann_index/lists.txt
```
which will contain one file path per line. Each of these files are themselves text files
containing a list of image file paths to process. The default checked-in `lists.txt` points
to a single image list file, `listing.txt`, which can be edited to point to a small set
of local files as desired to test the service.

Once `lists.txt` is set up properly, start the server with:

```bash
pip install tangelo
pip install opencv numpy   # or use conda
cd image_space/flann_index
tangelo --port 9220
```

### Girder with imagespace plugin

1. First ensure you have the proper [Girder_prerequisites](http://girder.readthedocs.org/en/latest/prerequisites.html),

2. Then [install Girder from a Git checkout](http://girder.readthedocs.org/en/latest/installation.html#install-from-git-checkout).

   Note: After any changes to the ImageSpace code, it is necessary to rebuild it by running `grunt` from the top level      Girder directory.

3. Install the ImageSpace plugin using `girder-install`
  ```bash
girder-install plugin -s /path/to/image_space/imagespace
```

4. Then set the following environment variables & **source** them, whenever they change
  ```bash
  export IMAGE_SPACE_SOLR=http://your_solr_server_rest_endpoint_OR_local_SolrCoreURLInstance
  export IMAGE_SPACE_SOLR_PREFIX=/server/path/to/image/dir
  export IMAGE_SPACE_PREFIX=http://path_to_image_repository_local_or_cloud
```

5. Finally start the Girder server with
  ```bash
  python -m girder
```

The default Girder app should be visible at [http://localhost:8080](http://localhost:8080).

Register for a new account, which will be the admin account. Go to the admin console and enter the
plugin configuration. Find the imagespace plugin and enable it. Girder should prompt you to restart
the server (or restart manually). Once restarted, again visit [http://localhost:8080](http://localhost:8080).
The application should be replaced with ImageSpace, with the full Girder app located at
[http://localhost:8080/girder](http://localhost:8080/girder).

### Additional Plugins
ImageSpace comes with additional plugins that may be enabled using the [Girder administration panel](http://girder.readthedocs.org/en/latest/installation.html#initial-setup). Each of these can be installed following an identical scheme as above (using girder-install).

Individual plugins may require certain environment variables be set, for example the ImageSpace FLANN plugin requires `IMAGE_SPACE_FLANN_INDEX` be set to the URL of the flann_index. These plugins will warn you when starting Girder if they don't have the required environment variables to function properly.


## License

Apache License v2
