#!/bin/bash
set -e

SOLR_URL="$1"
shift
CORE_NAME="$1"
shift
IMAGE_DIR="$1"
shift

# Wait for Solr container to return a 200
until curl --location --write-out "%{http_code}" --silent "$SOLR_URL/solr" | grep -q "^200"; do
    sleep 1
done;

# Configure Solr fields
curl "$SOLR_URL/solr/$CORE_NAME/schema" \
     -H 'Accept: application/json, text/plain, */*' \
     -H 'Content-Type: application/json;charset=utf-8' \
     --data '{"add-field":{"stored":"true","indexed":"true","name":"sha1sum_s_md","type":"string"}}' > /dev/null

# Import images
for filename in $(find "$IMAGE_DIR" -type f); do
    sha=$(sha1sum "$filename" | cut -d' ' -f1)
    filename=/images/$(basename "$filename")
    curl --silent "$SOLR_URL/solr/$CORE_NAME/update?commitWithin=10000" \
         -H 'Content-Type: application/json' \
         --data "[{'id' : '$filename', 'sha1sum_s_md': '$sha' }]" > /dev/null
done
