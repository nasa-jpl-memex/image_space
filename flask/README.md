Image Solr
===========

## Deploy
```
supervisorctl -c /home/bzaitlen/image_solr/scripts/supervisor.conf
supervisord -c /home/bzaitlen/image_solr/scripts/supervisor.conf
```

## Dev Guide

```
wget http://bit.ly/miniconda
bash Miniconda-latest-Linux-x86_64.sh
bash install.sh
conda env create -n image_solr -f environment.yaml
source activate image_solr
python server.py --debug
```


### DATABASE INTERACTIONS

- Models (models.py) defines db schema
- API (db_api.py) uses models.py
- VIEWS -- use API

