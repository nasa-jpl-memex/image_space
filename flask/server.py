import os
from image_space import app
import argparse

def parse_args():
    parser = argparse.ArgumentParser(description="Image Space (solr)")

    parser.add_argument("--debug",
                        action="store_true",
                        default=False,
                        help="debug app")

    return parser.parse_args()

app.config.from_pyfile('config.py')

if __name__ == "__main__":

    if not app.debug:
        import logging
        file_handler = logging.FileHandler('memex_explorer.log')
        file_handler.setLevel(logging.WARNING)
        app.logger.addHandler(file_handler)

    app.run(host=app.config['HOST'], port=app.config['PORT'], debug=app.config['DEBUG'])
