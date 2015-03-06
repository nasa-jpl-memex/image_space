from image_space import app
from image_space.models import Image, IMAGE_TABLE_NAME
from image_space import db
# Upload Handling

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']

# EXIF Processing

def process_exif(exif_data, img_path):
    # Get the EXIF data from the image



    LSVN = getattr(exif_data.get('EXIF LensSerialNumber'), 'values', None)
    MSNF = getattr(exif_data.get('MakerNote SerialNumberFormat'), 'values', None)
    BSN = getattr(exif_data.get('EXIF BodySerialNumber'), 'values', None)
    MISN = getattr(exif_data.get('MakerNote InternalSerialNumber'), 'values', None)
    MSN = getattr(exif_data.get('MakerNote SerialNumber'), 'values', None)
    IBSN = getattr(exif_data.get('Image BodySerialNumber'), 'values', None)

    image = Image(img_file = img_path,
                  EXIF_LensSerialNumber = LSVN,
                  MakerNote_SerialNumberFormat = MSNF,
                  EXIF_BodySerialNumber = BSN,
                  MakerNote_InternalSerialNumber = MISN,
                  MakerNote_SerialNumber = MSN,
                  Image_BodySerialNumber = IBSN,
                  Uploaded = 1,
                  )

    # Add uploaded image to the database
    db.session.add(image)
    db.session.commit()
