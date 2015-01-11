import sys
import os

from django.conf import settings

DEBUG = (os.environ.get("DJANGO_DEBUG", "on") == "on")
SECRET_KEY = os.environ.get("SECRET_KEY", '13_*cndavcg)r0=vmji@f=9o@c*bfp9zxx4v=t6*3u)z&)%^ma')
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost").split(",")

settings.configure(
    DEBUG = DEBUG,
    SECRET_KEY = SECRET_KEY,
    ROOT_URLCONF=__name__,
    ALLOWED_HOSTS=ALLOWED_HOSTS,
    MIDDLEWARE_CLASSES=(
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
    )
)

from django.conf.urls import url
from django.http import HttpResponse

def index(request):
    return HttpResponse("hello world")

urlpatterns = (
    url(r'^$', index),
)

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

if __name__ == "__main__":
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
