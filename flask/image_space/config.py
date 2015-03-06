import os
basedir = os.path.abspath(os.path.dirname(__file__))

DATABASE = "images.db"
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, DATABASE)
TITLE = 'IMAGE SPACE'
HOST = '0.0.0.0'
PORT = 8000
DEBUG = False

UPLOAD_DIR = os.environ.get("UPLOAD_DIR") or "/home/bzaitlen/image_solr/uploaded_images"
MEMEX_URL = os.environ.get('IMAGE_SPACE_SOLR') or "http://localhost:8081/solr/imagecatdev"
LOGGING_FILE = "image_solr.log"
STATIC_IMAGE_DIR = basedir+'/static/images_blurred/'
LOST_CAMERA_DIR = basedir+'/static/lost_camera_images_blurred/'

ALLOWED_EXTENSIONS = set(('tiff', 'tif', 'png', 'jpg', 'jpeg', 'gif'))
