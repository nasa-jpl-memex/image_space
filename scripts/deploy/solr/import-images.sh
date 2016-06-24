#!/bin/bash
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
set -e

CONTAINER_NAME="$1"
shift
CORE_NAME="$1"
shift
IMAGE_DIR="$1"
shift

# Wait for Solr container to return a 200
until docker exec -it "$CONTAINER_NAME" \
             curl --location --write-out "%{http_code}" \
             --silent "http://localhost:8983/solr" | grep -q "^200"; do
    sleep 1
done;

# Configure Solr fields
docker exec -it "$CONTAINER_NAME" \
       curl "http://localhost:8983/solr/$CORE_NAME/schema" \
       -H 'Accept: application/json, text/plain, */*' \
       -H 'Content-Type: application/json;charset=utf-8' \
       --data '{"add-field":{"stored":"true","indexed":"true","name":"sha1sum_s_md","type":"string"}}' > /dev/null

# Export UUIDs to a data file
TMP_FILE=$(mktemp)
DATA_FILE=$(mktemp)
find "$IMAGE_DIR" -type f -print0 | xargs -0 --max-procs=0 sha1sum > "$TMP_FILE"
echo "sha1sum_s_md,id" > "$DATA_FILE"
awk '{ printf("%s,%s\n", $1, $2); }' "$TMP_FILE" >> "$DATA_FILE"

# Replace top level image dir with /images
# i.e. the image is $IMAGE_DIR/foo/bar/baz.png -> /images/foo/bar/baz.png
sed -i "s|$IMAGE_DIR|/images|g" "$DATA_FILE"

# Copy the generated data csv into the container
docker cp "$DATA_FILE" "$CONTAINER_NAME:/opt/solr/solr-data-file.csv"
docker exec -it --user=root "$CONTAINER_NAME" chown solr:solr /opt/solr/solr-data-file.csv

# Import the data csv into Solr using the "Post Tool", see:
# https://cwiki.apache.org/confluence/display/solr/Post+Tool
docker exec -it --user=solr "$CONTAINER_NAME" bin/post -c "$CORE_NAME" /opt/solr/solr-data-file.csv
