# Image Space Tangelo Server

## Deployment

To start the server:

```
pip install tangelo
pip install requests
export IMAGE_SPACE_SOLR=http://your_solr_server_rest_endpoint
tangelo --root . --port 9224
```

The app should be visible at http://localhost:9224.

## License

Apache License v2
