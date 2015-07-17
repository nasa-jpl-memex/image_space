# Image Space Server

## Deployment

There are three processes involved for this app: a MongoDB server,
an image similarity server,
and a Girder web server containing the imagespace plugin.

### MongoDB

Start Mongo normally on the default port.

### Image similarity server

The image similarity server requires a set of images to load and process into the index.
The server will look at the file located here:
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

First ensure you have the proper [prerequisites](http://girder.readthedocs.org/en/latest/prerequisites.html),
then [install Girder from a Git checkout](http://girder.readthedocs.org/en/latest/installation.html#install-from-git-checkout).

Note that you also need to install [Tika-Python](http://github.com/chrismattmann/tika-python).
You can do so by:

```bash
pip2.7 install tika
```

To enable the imagespace plugin, first create a symbolic link to the imagespace plugin
and rebuild the app.

```bash
cd girder
ln -s path/to/image_space/imagespace ./plugins/imagespace
grunt
```

Now ensure Girder is stopped, and set the following environment variables

```bash
export IMAGE_SPACE_SOLR=http://your_solr_server_rest_endpoint
export IMAGE_SPACE_TIKA=/path/to/your/tika/tika-app-1.7.jar
export IMAGE_SPACE_FLANN_INDEX=http://localhost:9220/flann_index
export IMAGE_SPACE_COLUMBIA_INDEX=http://path_to_columbia_similarity_server
export IMAGE_SPACE_PREFIX=http://path_to_image_repository
```

Finally start the Girder server with

```bash
python -m girder
```

The app should be visible at [http://localhost:8080](http://localhost:8080).

Register for a new account, which will be the admin account. Go to the admin console and enter the
plugin configuration. Find the imagespace plugin and enable it. Girder should prompt you to restart
the server (or restart manually). One restarted, again visit [http://localhost:8080](http://localhost:8080).
The application should be replaced with Image Space, with the full Girder app located at
[http://localhost:8080/girder](http://localhost:8080/girder).

## License

Apache License v2
