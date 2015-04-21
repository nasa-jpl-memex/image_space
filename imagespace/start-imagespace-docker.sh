docker build -t kitware/imagespace .
docker run --name imagespace -p 8080:8080 kitware/imagespace python -m girder --database mongodb://`boot2docker ip`:27017/girder
