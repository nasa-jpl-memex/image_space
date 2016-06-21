#!/bin/bash

set -e

# Start up Girder in the background
(python -m girder "$@" > entrypoint.log 2>&1) &

# Wait for it to be done starting
until grep -qi 'engine bus started' entrypoint.log; do sleep 1; done;

# Bootstrap with user, assetstore, and ImageSpace plugin enabled
python /bootstrap-imagespace.py

# Tear down Girder
kill $(pgrep -f girder)

# Start Girder for the container process
python -m girder "$@"
