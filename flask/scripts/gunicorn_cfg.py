bind='0.0.0.0:8000'
pidfile='gunicorn_pid'
accesslog='gunicorn_access.log'
errorlog='gunicorn_error.log'
workers=4
worker_class='sync'
