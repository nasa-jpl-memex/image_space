docker build --tag testing/mongodb .
docker run --name mongo_instance_001 -d -p 27017:27017 testing/mongodb
