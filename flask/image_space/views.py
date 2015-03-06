import os
import exifread
import requests

from flask import redirect, flash, render_template, request, url_for, send_from_directory, jsonify
from werkzeug import secure_filename

from image_space import app
from image_space.db_api import get_all_images,\
                               filter_all, \
                               clear_uploaded_images, \
                               get_uploaded_image_names, \
                               get_info, \
                               reset_db, \
                               get_info_serial
from .auth import requires_auth
import utils

@app.route('/')
@app.route('/overview')
@requires_auth
def overview():
    return render_template('overview.html')

@app.route('/image_table')
@app.route('/image_table/<int:page>')
@requires_auth
def image_table(page=0):

    url_serial = os.path.join(app.config['MEMEX_URL'],
                             "select?q=serial_number%3A%5B*+TO+*%5D&start={}&rows={}"
                             "&wt=json&indent=true".format(page, page+200))
    url_camera_serial = os.path.join(app.config['MEMEX_URL'],
                             "select?q=camera_serial_number%3A%5B*+TO+*%5D&start={}&rows={}"
                             "&wt=json&indent=true".format(page, page+200))
    
    urls = [url_serial, url_camera_serial]
    solr_docs = []
    for url in urls:
        r = requests.get(url)
        solr_docs.extend(r.json()['response']['docs'])

    for d in solr_docs:
        d['id'] = d['id'].strip('/')

        d['serial_number'] = d.get("serial_number") or ["Missing"]
        d['serial_number'] = d['serial_number'][0]

        d['camera_serial_number'] = d.get("camera_serial_number") or ["Missing"]
        d['camera_serial_number'] = d['camera_serial_number'][0]

        d['exif_datetimeoriginal'] = d.get('exif_datetimeoriginal') or ["Missing"]
        d['exif_datetimeoriginal'] = d['exif_datetimeoriginal'][0]

    return render_template('image_table.html', images=solr_docs, page=page)

def lost_camera_retreive(serial_num):
    if not serial_num:
        return []
    camera_dir = app.config['LOST_CAMERA_DIR']
    path = os.path.join(camera_dir, serial_num)
    static_dir_path = os.path.join(os.path.dirname(__file__), "static")

    list_of_pics = []
    if os.path.exists(path):
        for root, dirs, files in os.walk(path):
            for file in files:
                full_path = os.path.join(root, file)
                relative_path = os.path.relpath(full_path, static_dir_path)
                if 'stolen' in relative_path:
                    list_of_pics.append((relative_path, file, 'stolencamera'))
                else:
                    list_of_pics.append((relative_path, file, 'cameratrace'))

    return list_of_pics

def image_retrieve(filename, size=None):
        return send_from_directory(app.config['UPLOAD_DIR'], filename)

def image_crawled(image, size=None):
        dirname = os.path.join("/", os.path.dirname(image))
        basename = os.path.basename(image)
        return send_from_directory(dirname, basename)

@app.route('/crawled/<path:image>')
@requires_auth
def crawled(image):
    return image_crawled(image)

@app.route('/uploaded/<image>')
@requires_auth
def uploaded(image):
    return image_retrieve(image)

def serve_upload_page():
    """Returns response to upload an image and lists other uploaded images"""
    image_names = get_uploaded_image_names()
    image_pages = [ {"name":filename, "url":url_for('compare', image=filename) } \
                    for filename in image_names]
    return render_template('upload.html', image_pages=image_pages)

@app.route('/clear')
@requires_auth
def clear_uploads():
    clear_uploaded_images()
    return redirect(url_for('compare'))

@app.route('/reset')
@requires_auth
def reset():
    reset_db()
    clear_uploaded_images()
    flash('Reset Demo successfully', 'success')
    return redirect(url_for('overview'))

@app.route('/upload', methods=['GET', 'POST'])
@requires_auth
def upload():
    if request.method == 'GET':
        return render_template('upload.html')
    elif request.method == 'POST':
        uploaded_file = request.files['file']

        if uploaded_file and utils.allowed_file(uploaded_file.filename):
            filename = secure_filename(uploaded_file.filename)
            full_path = os.path.join(app.config['UPLOAD_DIR'], filename)
            uploaded_file.save(full_path)

            with open(full_path, 'rb') as f:
                exif_data = exifread.process_file(f)
                utils.process_exif(exif_data, filename)

                return jsonify(dict(
                    album_path=url_for('compare', image=filename)
                    ))

        else:
            allowed = ', '.join(app.config['ALLOWED_EXTENSIONS'])
            response = jsonify(dict(
                error="File does not match allowed extensions: %s" % allowed))
            response.status_code = 500
            return response

@app.route('/team')
@requires_auth
def team():
    return render_template('team.html')

@app.route('/compare')
@app.route('/compare/<image>')
@app.route('/compare/<path:image>')
@requires_auth
def compare(image=None):
    if image is None:
        return serve_upload_page()

    # image_obj = get_info(image)[0]

    crawled_image_flag = False

    if "/compare/<path:image>" == str(request.url_rule):
        full_path = os.path.join("/", image)
        crawled_image_flag = True
    else:
        full_path = os.path.join(app.config['UPLOAD_DIR'], image)

    # detect file type
    basename = os.path.basename(full_path)
    url = "http://localhost:8899/detect/stream"
    headers = {'Content-Disposition' : 'attachment; filename='+basename}
    r = requests.put(url, data=open(full_path), headers=headers)

    content_type = r.text if r.text else 'application/octet-stream'
    print(content_type)

    headers = {'content-type': content_type,  'Accept': 'application/json'}

    url = "http://localhost:8899/meta"
    r = requests.put(url, data=open(full_path), headers=headers)
    json_dict = r.json()
    serial_num = json_dict.get("Serial Number") or json_dict.get("Camera Serial Number")
    exif_info = dict([(k, v) for k, v in json_dict.iteritems() if "exif" in k.lower()])
    exif_info['exif:serial_num'] = serial_num   # store serial number is key to be called by jinja

    url_serial_number = os.path.join(app.config['MEMEX_URL'],
                             "select?q=serial_number:{}&wt=json&indent=true".format(serial_num))

    url_camera_serial_number = os.path.join(app.config['MEMEX_URL'],
                             "select?q=camera_serial_number:{}&wt=json&indent=true".format(serial_num))
    urls = [url_serial_number, url_camera_serial_number]

    solr_docs = []
    for url in urls:
        try:
            r = requests.get(url)
            solr_docs.extend(r.json()['response']['docs'])
        except ValueError:
            pass

    for d in solr_docs:
        d['dirname'] = os.path.dirname(d['id'])
        d['basename'] = os.path.basename(d['id'])
        d['id'] = d['id'].strip('/')
        d['serial_number_solr'] = d.get("serial_number") or d.get("camera_serial_number")   # custom key for either serial_number style
        d['serial_number_solr'] = d['serial_number_solr'][0]

    # find matches form lostcameras
    # serial_matches = get_info_serial(serial_num)
    lost_camera_matches = lost_camera_retreive(serial_num)
    return render_template('compare.html', num_images=10, image=image, exif_info=exif_info,
                           solr_docs=solr_docs, lost_camera_matches=lost_camera_matches, crawled_image_flag=crawled_image_flag)

@app.route('/analysis')
def analysis():
    return render_template('analysis.html')

@app.route('/map')
def map():
    return render_template('map.html')
