"""Tests for the Compass images functions.

Not all of Compass is implemented, and the arrangement of Compass functions
doesn't exactly match the arrangement in the original documentation.
Regardless, this is a good starting place:

http://compass-style.org/reference/compass/helpers/

Some functions appear to be undocumented, but nonetheless are part of Compass's
Ruby code.
"""

from scss.expression import Calculator
from scss.functions.compass.images import COMPASS_IMAGES_LIBRARY
from scss.rule import Namespace


import pytest
from scss import config
import os
from _pytest.monkeypatch import monkeypatch
xfail = pytest.mark.xfail

# TODO many of these tests could also stand to test for failure cases

config.PROJECT_ROOT = os.path.normpath(os.path.dirname(os.path.abspath(__file__ + '/../../../')))

@pytest.fixture
def calc():
    ns = Namespace(functions=COMPASS_IMAGES_LIBRARY)
    return Calculator(ns).evaluate_expression


def test_image_url(calc):
    # nb: config.IMAGES_URL is None and defaults to this
    images_url = config.STATIC_URL
    assert calc('image-url("/some_path.jpg")').render() == 'url({0}some_path.jpg)'.format(images_url)


# inline-image
def test_inline_image(calc):
    monkeypatch().setattr(config, 'IMAGES_ROOT', os.path.join(config.PROJECT_ROOT, 'tests/files/images'))

    f = open(os.path.join(config.PROJECT_ROOT, 'tests/files/images/test-qr.base64.txt'), 'rb')
    font_base64 = f.read()
    f.close()
    assert 'url(data:image/png;base64,%s)' % font_base64 == calc('inline_image("/test-qr.png")').render()


def test_inline_cursor(calc):
    monkeypatch().setattr(config, 'IMAGES_ROOT', os.path.join(config.PROJECT_ROOT, 'tests/files/cursors'))

    f = open(os.path.join(config.PROJECT_ROOT, 'tests/files/cursors/fake.base64.txt'), 'rb')
    font_base64 = f.read()
    f.close()
    assert 'url(data:image/cur;base64,%s)' % font_base64 == calc('inline_image("/fake.cur")').render()
