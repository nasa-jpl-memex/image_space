import requests
import os

base = os.environ['IMAGE_SPACE_SOLR'] + '/select?wt=json&indent=true'
def run(pivot='tiff_imagelength,tiff_imagewidth'):
    result = requests.get(base + '&q=*&rows=1&facet=on&facet.pivot=' + pivot).json()
    return result['facet_counts']['facet_pivot'][pivot]
