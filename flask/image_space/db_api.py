from image_space.models import Image, IMAGE_TABLE_NAME
from image_space import db, app
import os

# perhaps we want to convert sqlachemy fetches into proper python dicts
# this is immediately useful
def _sqa_to_dict(query_list, key):

    table = query_list[0].__table__
    columns = [col.name for col in table.columns]

    result = {}
    for d in query_list:
        t_dict = {}
        for c in columns:
            t_dict[c] = get_all_images(d, c)

        result[d[key]] = t_dict


def filter_all(columns):
        """
        Returns a filters list of tuples
        """
        if isinstance(columns, str):
            columns = [columns]

        cols = [getattr(Image, col) for col in columns]
        s = db.session()
        return s.query(*cols).all()


def get_all_images():
        """
        Returns a list of all images (data is stored in an Image object)
        """
        s = db.session()
        return s.query(Image).all()

        # or with blaze
        # from blaze import SQL
        # sql = SQL(str(db.engine.url), IMAGE_TABLE_NAME)
        # print(sql[0])


def get_info(name):
    """
    Returns Image
    """
    s = db.session()
    return s.query(Image).filter(Image.img_file == name).all()


def get_info_serial(serial):
    """
    Returns Image
    """
    s = db.session()
    return s.query(Image).filter(Image.EXIF_BodySerialNumber.isnot(None)).filter(Image.EXIF_BodySerialNumber == serial).all()


def filter_images(**kwargs):
    pass


def get_uploaded_image_names():
    upload_dir = app.config['UPLOAD_DIR']
    ret_list = os.listdir(upload_dir)
    return ret_list


def clear_uploaded_images():
    upload_dir = app.config['UPLOAD_DIR']
    for the_file in os.listdir(upload_dir):
        file_path = os.path.join(upload_dir, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception, e:
            print e


def reset_db():
    s = db.session()
    imgs_to_delete = s.query(Image).filter(Image.Uploaded ==1).all()
    for image in imgs_to_delete:
        s.delete(image)
    s.commit()
