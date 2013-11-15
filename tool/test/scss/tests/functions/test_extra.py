"""Tests for extra non-standard functions.

These tests call the relevant functions directly, rather than going through a
calculator.  They all do a considerable amount of work, and that's what's being
tested, rather than the parsing or type system.
"""
import scss.functions.extra as libextra
from scss.types import Boolean, Color, Number

import pytest
xfail = pytest.mark.xfail


# TODO: currently these all just call the functions and make sure they pass.
# would be nice to check the output, though that's a little tedious.

def test_background_noise():
    libextra.background_noise(Number(0.5), Number(0.5), Number(100), Boolean(True), color=Color.from_name('green'))


def test_background_brushed():
    libextra.background_brushed(Number(0.5), Number(0.5), Color.from_name('red'), Number(0.5))


def test_grid_image():
    # TODO this should accept sass values only  :|
    libextra._grid_image(5, 100, 5, 100)


def test_image_color():
    libextra.image_color(Color.from_rgb(1, 1, 0))
    assert True
