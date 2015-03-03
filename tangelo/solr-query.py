import requests
import os

base = os.environ['IMAGE_SPACE_SOLR'] + '/select?wt=json&indent=true'
def run(query='*', limit='100'):
    result = requests.get(base + '&q=' + query + '&rows=' + limit).json()
    return result['response']['docs']
