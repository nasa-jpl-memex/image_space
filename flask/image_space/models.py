import os

from image_space import app, db

IMAGE_TABLE_NAME = 'exif_info'
class Image(db.Model):
    __tablename__ = IMAGE_TABLE_NAME
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    img_file = db.Column(db.String(140))
    EXIF_LensSerialNumber = db.Column(db.String(140))
    MakerNote_SerialNumberFormat = db.Column(db.String(140))
    EXIF_BodySerialNumber = db.Column(db.String(140))
    MakerNote_InternalSerialNumber = db.Column(db.String(140))
    MakerNote_SerialNumber = db.Column(db.String(140))
    Image_BodySerialNumber = db.Column(db.String(140))
    Uploaded = db.Column(db.Integer)

    def __unicode__(self):
        return self.img_file
