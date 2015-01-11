import json
import os

from django.conf import settings
from django.http import Http404
from django.shortcuts import render
from django.template import Template, Context
from django.template.loader_tags import BlockNode
from django.utils._os import safe_join

def get_page_or_404(name):
    """return page or raise 404"""
    try:
        file_path = safe_join(settings.SITE_PAGES_DIRECTORY, name)
    except ValueError:
        raise Http404('Page not found')
    else:
        if not os.path.exists(file_path):
            raise Http404('Page not found')

    with open(file_path, 'r') as f:
        page = Template(f.read())

    meta = None
    for i, node in enumerate(list(page.nodelist)):
        if isinstance(node, BlockNode) and node.name == "context":
            meta = page.nodelist.pop(i)
            break

    page._meta = meta
    return page


def page(request, slug='index'):
    """process page request"""
    file_name = '{}.html'.format(slug)
    page = get_page_or_404(file_name)
    context = {
        'slug': slug,
        'page': page,
    }

    if page._meta is not None:
        meta = page._meta.render(Context())
        extra_content = json.loads(meta)
        context.update(extra_content)
    return render(request, 'page.html', context)
