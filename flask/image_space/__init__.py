from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = 'some_secret'
db = SQLAlchemy(app)

from image_space import views
