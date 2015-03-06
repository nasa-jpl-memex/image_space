from __future__ import absolute_import, division, print_function

import sys
import logging
import logging.handlers

from .config import LOGGING_FILE as logging_file

# hack to hide messages if we log before setting up handler
logging.root.manager.emittedNoHandlerWarning = True


def setup_logging(filename=logging_file, log_level=logging.DEBUG, max_size=100000, rollovers=3):
    """Easy to use logging - on reload it will not add multiple stdout handlers

        Args:
          filename (optional): full path to log file or None to indicate stdout
          log_level:  logging log level Defaults to DEBUG
          max_size:  maximum bytes per file. Defaults to 100000
          rollovers: number of roll over files. Defaults to 3

        Returns:
          None

        """

    root_logger = logging.getLogger("")
    root_logger.setLevel(log_level)

    handler = logging.handlers.RotatingFileHandler(filename, 'a', max_size, rollovers)

    formatter = logging.Formatter("%(asctime)s:%(levelname)9s:%(name)20s: %(message)s")
    handler.setFormatter(formatter)

    consoleHandler = logging.StreamHandler(sys.stdout)
    console_formatter = logging.Formatter(">>> %(message)s")
    consoleHandler.setFormatter(console_formatter)
    consoleHandler.setLevel(logging.INFO)

    root_logger.addHandler(consoleHandler)

    # occurs if you are calling setup_logging in an ipython terminal while testing
    # results in multiple stdout handlers and need to handle appropriately.
    add_handler = True
    for handle in root_logger.handlers:
        try:
            if getattr(handle,"baseFilename",None) == handler.baseFilename:
                add_handler = False
                duplicate_handler = handler.baseFilename
                break
        except AttributeError, e:
            # handlers without baseFilename
            root_logger.debug(str(e))
            pass

    if add_handler:
        root_logger.debug("Added handler to the root logger.")
        root_logger.addHandler(handler)
    else:
        root_logger.debug("Duplicate logging handler: %s" % (duplicate_handler,))


def main():
    """
    Example showing how to initialize the root logger and then declare additional loggers
    """

    # Initialze the Root logger.
    setup_logging()

    logger = logging.getLogger("loggerName")
    logger.setLevel(logging.DEBUG)

    # Use the logger
    logger.debug("First log message.")
    logger.debug("Second log message.")

if __name__ == "__main__":
    main()
