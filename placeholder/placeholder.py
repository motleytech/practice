import sys
import os
import hashlib

from io import BytesIO
from PIL import Image, ImageDraw

from django import forms
from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest
from django.conf.urls import url
from django.views.decorators.http import etag
from django.core.wsgi import get_wsgi_application
from django.shortcuts import render
from django.core.urlresolvers import reverse

DEBUG = (os.environ.get("DJANGO_DEBUG", "on") == "on")
SECRET_KEY = os.environ.get("SECRET_KEY", '+f3cuf4i#r*$3)qv*sbz$n+y=e(kaes61v^4a=w#w)4&-$6@yb')
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost").split(",")

BASE_DIR = os.path.dirname(__file__)


settings.configure(
    DEBUG = DEBUG,
    SECRET_KEY = SECRET_KEY,
    ROOT_URLCONF=__name__,
    ALLOWED_HOSTS=ALLOWED_HOSTS,
    MIDDLEWARE_CLASSES=(
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
    ),
    INSTALLED_APPS=(
        'django.contrib.staticfiles',
    ),
    TEMPLATE_DIRS=(
        os.path.join(BASE_DIR, 'templates'),
    ),
    STATICFILES_DIRS=(
        os.path.join(BASE_DIR, 'static'),
    ),
    STATIC_URL='/static/',
)

from django.core.cache import cache


class ImageForm(forms.Form):
    """ Form to validate placeholder image data """
    height = forms.IntegerField(min_value=1, max_value=4000)
    width = forms.IntegerField(min_value=1, max_value=4000)
    color = forms.CharField(max_length=20)

    def generate(self, image_format="PNG"):
        """ generate image of w*h in given format """
        height = self.cleaned_data['height']
        width = self.cleaned_data['width']
        color = self.cleaned_data['color'].lower()
        cachekey = "{}x{}x{}".format(width, height, color)
        content = cache.get(cachekey)
        if content is None:
            image = Image.new("RGB", (width, height), color)
            draw = ImageDraw.Draw(image)
            text = "{} x {}".format(width, height)
            textwidth, textheight = draw.textsize(text)
            if textwidth < width and textheight < height:
                texttop = (height - textheight)/2
                textleft = (width - textwidth)/2
                fillcolor = (255, 255, 255) if color != 'white' else (0, 0, 0)
                draw.text((textleft, texttop), text, fill=fillcolor)
            content = BytesIO()
            image.save(content, image_format)
            content.seek(0)
            cache.set(cachekey, content, 60*60)
        return content


def index(request):
    example = reverse('placeholder', kwargs={'width':50, 'height':50, 'color':'red'})
    context = {
        'example': request.build_absolute_uri(example)
    }
    return render(request, 'home.html', context)


def generate_etag(request, width, height, color):
    content = "Placeholder: {0}x{1}x{2}".format(width, height, color)
    digest = hashlib.sha1(content.encode('utf-8')).hexdigest()
    print "Content = {0}\nDigest value = {1}".format(content, digest)
    return digest


@etag(generate_etag)
def placeholder(request, width=0, height=0, color="red"):
    form = ImageForm({ 'height':height, 'width':width, 'color':color })

    if form.is_valid():
        height = form.cleaned_data['height']
        width = form.cleaned_data['width']

        image = form.generate()
        print "Creating response"

        return HttpResponse(image, content_type="image/png")
    else:
        return HttpResponseBadRequest("Invalid image dimensions")


urlpatterns = (
    url(r'^image/(?P<width>\d+)x(?P<height>\d+)x(?P<color>[a-zA-Z0-9]*)/$', placeholder,
        name='placeholder'),
    url(r'^$', index, name='homepage'),
)


application = get_wsgi_application()


if __name__ == "__main__":
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
