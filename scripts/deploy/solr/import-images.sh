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

# Export UUIDs to a CSV file
DATA_FILE=$(mktemp)
NUM_CORES=$(python -c 'import multiprocessing as mp; print(mp.cpu_count())')

# Format the CSV and replace top level image dir with /images
# i.e. the image is $IMAGE_DIR/foo/bar/baz.png -> /images/foo/bar/baz.png
find "$IMAGE_DIR" -type f -print0 | xargs -0 -P $NUM_CORES sha1sum | awk -v IMAGE_DIR="$IMAGE_DIR" '
    BEGIN {
        printf("sha1sum_s_md,id\n");
    }
    {
        sub(IMAGE_DIR, "/images", $2);
        printf("%s,%s\n", $1, $2);
    }' > "$DATA_FILE"

# Copy the generated data csv into the container
docker cp "$DATA_FILE" "$CONTAINER_NAME:/opt/solr/solr-data-file.csv"
docker exec -it --user=root "$CONTAINER_NAME" chown solr:solr /opt/solr/solr-data-file.csv

# Import the data csv into Solr using the "Post Tool", see:
# https://cwiki.apache.org/confluence/display/solr/Post+Tool
docker exec -it --user=solr "$CONTAINER_NAME" bin/post -c "$CORE_NAME" /opt/solr/solr-data-file.csv
