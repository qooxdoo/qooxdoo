"""Tests for the core Sass functions, as defined in the original Sass
documentation:

http://sass-lang.com/docs/yardoc/Sass/Script/Functions.html
"""
from __future__ import division

from scss.expression import Calculator
from scss.functions.core import CORE_LIBRARY
from scss.rule import Namespace
from scss.types import Color, Number, String

import pytest
xfail = pytest.mark.xfail


# TODO many of these tests could also stand to test for failure cases

@pytest.fixture
def calc():
    ns = Namespace(functions=CORE_LIBRARY)
    return Calculator(ns).evaluate_expression


# ------------------------------------------------------------------------------
# RGB functions

def test_rgb(calc):
    assert calc('rgb(128, 192, 224)') == Color.from_rgb(128/255, 192/255, 224/255)
    assert calc('rgb(20%, 40%, 60%)') == Color.from_rgb(0.2, 0.4, 0.6)


def test_rgba(calc):
    # four args (css-style)
    assert calc('rgba(128, 192, 224, 0.5)') == Color.from_rgb(128/255, 192/255, 224/255, 0.5)
    assert calc('rgba(20%, 40%, 60%, 0.7)') == Color.from_rgb(0.2, 0.4, 0.6, 0.7)

    # two args (modify alpha of existing color)
    assert calc('rgba(red, 0.4)') == Color.from_rgb(1., 0., 0., 0.4)


def test_red(calc):
    assert calc('red(orange)') == Number(255)


def test_green(calc):
    assert calc('green(orange)') == Number(165)


def test_blue(calc):
    assert calc('blue(orange)') == Number(0)


def test_mix(calc):
    # Examples from the Ruby docs
    # Note that the results have been adjusted slightly; Ruby floors the mixed
    # channels, but we round
    assert calc('mix(#f00, #00f)') == calc('#800080')
    assert calc('mix(#f00, #00f, 25%)') == calc('#4000bf')
    assert calc('mix(rgba(255, 0, 0, 0.5), #00f)') == calc('rgba(64, 0, 191, 0.75)')


# ------------------------------------------------------------------------------
# HSL functions

def test_hsl(calc):
    # Examples from the CSS 3 color spec, which Sass uses
    # (http://www.w3.org/TR/css3-color/#hsl-color)
    assert calc('hsl(0, 100%, 50%)') == Color.from_rgb(1., 0., 0.)
    assert calc('hsl(120, 100%, 50%)') == Color.from_rgb(0., 1., 0.)
    assert calc('hsl(120, 100%, 25%)') == Color.from_rgb(0., 0.5, 0.)
    assert calc('hsl(120, 100%, 75%)') == Color.from_rgb(0.5, 1., 0.5)
    assert calc('hsl(120, 75%, 75%)') == Color.from_rgb(0.5625, 0.9375, 0.5625)


def test_hsla(calc):
    # Examples from the CSS 3 color spec
    assert calc('hsla(120, 100%, 50%, 1)') == Color.from_rgb(0., 1., 0.,)
    assert calc('hsla(240, 100%, 50%, 0.5)') == Color.from_rgb(0., 0., 1., 0.5)
    assert calc('hsla(30, 100%, 50%, 0.1)') == Color.from_rgb(1., 0.5, 0., 0.1)


def test_hue(calc):
    assert calc('hue(yellow)') == Number(60, unit='deg')


def test_saturation(calc):
    assert calc('saturation(yellow)') == Number(100, unit='%')


def test_lightness(calc):
    assert calc('lightness(yellow)') == Number(50, unit='%')


# HSL manipulation functions

def test_adjust_hue(calc):
    # Examples from the Ruby docs
    assert calc('adjust-hue(hsl(120, 30%, 90%), 60deg)') == calc('hsl(180, 30%, 90%)')
    assert calc('adjust-hue(hsl(120, 30%, 90%), -60deg)') == calc('hsl(60, 30%, 90%)')
    assert calc('adjust-hue(#811, 45deg)') == Color.from_rgb(136/255, 106.25/255, 17/255)


def test_lighten(calc):
    # Examples from the Ruby docs
    assert calc('lighten(hsl(0, 0%, 0%), 30%)') == calc('hsl(0, 0, 30)')
    assert calc('lighten(#800, 20%)') == calc('#e00')


def test_darken(calc):
    # Examples from the Ruby docs
    assert calc('darken(hsl(25, 100%, 80%), 30%)') == calc('hsl(25, 100%, 50%)')
    assert calc('darken(#800, 20%)') == calc('#200')


def test_saturate(calc):
    # Examples from the Ruby docs
    assert calc('saturate(hsl(120, 30%, 90%), 20%)') == calc('hsl(120, 50%, 90%)')
    assert calc('saturate(#855, 20%)') == Color.from_rgb(158.1/255, 62.9/255, 62.9/255)


def test_desaturate(calc):
    # Examples from the Ruby docs
    assert calc('desaturate(hsl(120, 30%, 90%), 20%)') == calc('hsl(120, 10%, 90%)')
    assert calc('desaturate(#855, 20%)') == Color.from_rgb(113.9/255, 107.1/255, 107.1/255)


def test_grayscale(calc):
    assert calc('grayscale(black)') == Color.from_rgb(0., 0., 0.)
    assert calc('grayscale(white)') == Color.from_rgb(1., 1., 1.)
    assert calc('grayscale(yellow)') == Color.from_rgb(0.5, 0.5, 0.5)


def test_grayscale_css_filter(calc):
    # grayscale(number) is a CSS filter and should be left alone
    assert calc('grayscale(1)') == String("grayscale(1)")


def test_complement(calc):
    assert calc('complement(black)') == Color.from_rgb(0., 0., 0.)
    assert calc('complement(white)') == Color.from_rgb(1., 1., 1.)
    assert calc('complement(yellow)') == Color.from_rgb(0., 0., 1.)


def test_invert(calc):
    assert calc('invert(black)') == Color.from_rgb(1., 1., 1.)
    assert calc('invert(white)') == Color.from_rgb(0., 0., 0.)
    assert calc('invert(yellow)') == Color.from_rgb(0., 0., 1.)


# ------------------------------------------------------------------------------
# Opacity functions

def test_alpha_opacity(calc):
    assert calc('alpha(black)') == Number(1.)
    assert calc('alpha(rgba(black, 0.5))') == Number(0.5)
    assert calc('alpha(rgba(black, 0))') == Number(0.)

    # opacity is a synonym
    assert calc('opacity(black)') == Number(1.)
    assert calc('opacity(rgba(black, 0.5))') == Number(0.5)
    assert calc('opacity(rgba(black, 0))') == Number(0.)


@xfail(reason="currently a parse error -- so it still works in practice, but...")
def test_alpha_ie_filter(calc):
    # alpha() is supposed to leave the IE filter syntax alone
    assert calc('alpha(filter=20)') == "alpha(filter=20)"


def test_opacify_fadein(calc):
    # Examples from the Ruby docs
    assert calc('opacify(rgba(0, 0, 0, 0.5), 0.1)') == calc('rgba(0, 0, 0, 0.6)')
    assert calc('opacify(rgba(0, 0, 17, 0.8), 0.2)') == calc('#001')

    # fade-in is a synonym
    assert calc('fade-in(rgba(0, 0, 0, 0.5), 0.1)') == calc('rgba(0, 0, 0, 0.6)')
    assert calc('fade-in(rgba(0, 0, 17, 0.8), 0.2)') == calc('#001')


def test_transparentize_fadeout(calc):
    # Examples from the Ruby docs
    assert calc('transparentize(rgba(0, 0, 0, 0.5), 0.1)') == calc('rgba(0, 0, 0, 0.4)')
    assert calc('transparentize(rgba(0, 0, 0, 0.8), 0.2)') == calc('rgba(0, 0, 0, 0.6)')

    # fade-out is a synonym
    assert calc('fade-out(rgba(0, 0, 0, 0.5), 0.1)') == calc('rgba(0, 0, 0, 0.4)')
    assert calc('fade-out(rgba(0, 0, 0, 0.8), 0.2)') == calc('rgba(0, 0, 0, 0.6)')


# ------------------------------------------------------------------------------
# Other color functions

def test_adjust_color(calc):
    # Examples from the Ruby docs
    assert calc('adjust-color(#102030, $blue: 5)') == calc('#102035')
    assert calc('adjust-color(#102030, $red: -5, $blue: 5)') == calc('#0b2035')
    assert calc('adjust-color(hsl(25, 100%, 80%), $lightness: -30%, $alpha: -0.4)') == calc('hsla(25, 100%, 50%, 0.6)')


def test_scale_color(calc):
    # Examples from the Ruby docs
    assert calc('scale-color(hsl(120, 70, 80), $lightness: 50%)') == calc('hsl(120, 70, 90)')
    assert calc('scale-color(rgb(200, 150, 170), $green: -40%, $blue: 70%)') == calc('rgb(200, 90, 229)')
    assert calc('scale-color(hsl(200, 70, 80), $saturation: -90%, $alpha: -30%)') == calc('hsla(200, 7, 80, 0.7)')


def test_change_color(calc):
    # Examples from the Ruby docs
    assert calc('change-color(#102030, $blue: 5)') == calc('#102005')
    assert calc('change-color(#102030, $red: 120, $blue: 5)') == calc('#782005')
    assert calc('change-color(hsl(25, 100%, 80%), $lightness: 40%, $alpha: 0.8)') == calc('hsla(25, 100%, 40%, 0.8)')

    assert calc('change-color(red, $hue: 240)') == calc('blue')


def test_ie_hex_str(calc):
    # Examples from the Ruby docs
    assert calc('ie-hex-str(#abc)') == calc('"#FFAABBCC"')
    assert calc('ie-hex-str(#3322BB)') == calc('"#FF3322BB"')
    assert calc('ie-hex-str(rgba(0, 255, 0, 0.5))') == calc('"#8000FF00"')


# ------------------------------------------------------------------------------
# String functions

def test_unquote(calc):
    # Examples from the Ruby docs
    ret = calc('unquote("foo")')
    assert ret == String('foo')
    assert ret.quotes is None
    ret = calc('unquote(foo)')
    assert ret == String('foo')
    assert ret.quotes is None

    assert calc('unquote((one, two, three))') == String('one, two, three')


def test_quote(calc):
    # Examples from the Ruby docs
    ret = calc('quote("foo")')
    assert ret == String('foo')
    assert ret.quotes == '"'
    ret = calc('quote(foo)')
    assert ret == String('foo')
    assert ret.quotes == '"'


# ------------------------------------------------------------------------------
# Number functions

def test_percentage(calc):
    # Examples from the Ruby docs
    assert calc('percentage(100px / 50px)') == calc('200%')


def test_round(calc):
    # Examples from the Ruby docs
    assert calc('round(10.4px)') == calc('10px')
    assert calc('round(10.6px)') == calc('11px')


def test_ceil(calc):
    # Examples from the Ruby docs
    assert calc('ceil(10.4px)') == calc('11px')
    assert calc('ceil(10.6px)') == calc('11px')


def test_floor(calc):
    # Examples from the Ruby docs
    assert calc('floor(10.4px)') == calc('10px')
    assert calc('floor(10.6px)') == calc('10px')


def test_abs(calc):
    # Examples from the Ruby docs
    assert calc('abs(10px)') == calc('10px')
    assert calc('abs(-10px)') == calc('10px')


def test_min(calc):
    # Examples from the Ruby docs
    assert calc('min(1px, 4px)') == calc('1px')
    assert calc('min(5em, 3em, 4em)') == calc('3em')


def test_max(calc):
    # Examples from the Ruby docs
    assert calc('max(1px, 4px)') == calc('4px')
    assert calc('max(5em, 3em, 4em)') == calc('5em')


# ------------------------------------------------------------------------------
# List functions

def test_length(calc):
    # Examples from the Ruby docs
    assert calc('length(10px)') == calc('1')
    assert calc('length(10px 20px 30px)') == calc('3')


def test_nth(calc):
    # Examples from the Ruby docs
    assert calc('nth(10px 20px 30px, 1)') == calc('10px')
    assert calc('nth((Helvetica, Arial, sans-serif), 3)') == calc('sans-serif')


def test_join(calc):
    # Examples from the Ruby docs
    assert calc('join(10px 20px, 30px 40px)') == calc('10px 20px 30px 40px')
    assert calc('join((blue, red), (#abc, #def))') == calc('blue, red, #abc, #def')
    assert calc('join(10px, 20px)') == calc('10px 20px')
    assert calc('join(10px, 20px, comma)') == calc('10px, 20px')
    assert calc('join((blue, red), (#abc, #def), space)') == calc('blue red #abc #def')


def test_append(calc):
    # Examples from the Ruby docs
    assert calc('append(10px 20px, 30px)') == calc('10px 20px 30px')
    assert calc('append((blue, red), green)') == calc('blue, red, green')
    assert calc('append(10px 20px, 30px 40px)') == calc('10px 20px (30px 40px)')
    assert calc('append(10px, 20px, comma)') == calc('10px, 20px')
    assert calc('append((blue, red), green, space)') == calc('blue red green')


def test_zip(calc):
    # Examples from the Ruby docs
    assert calc('zip(1px 1px 3px, solid dashed solid, red green blue)') == calc('1px solid red, 1px dashed green, 3px solid blue')


def test_index(calc):
    # Examples from the Ruby docs
    assert calc('index(1px solid red, solid)') == calc('2')
    assert calc('index(1px solid red, dashed)') == calc('false')


# ------------------------------------------------------------------------------
# Map functions


# ...


# ------------------------------------------------------------------------------
# Introspection functions

def test_type_of(calc):
    # Examples from the Ruby docs
    assert calc('type-of(100px)') == calc('number')
    assert calc('type-of(asdf)') == calc('string')
    assert calc('type-of("asdf")') == calc('string')
    assert calc('type-of(true)') == calc('bool')
    assert calc('type-of(#fff)') == calc('color')
    assert calc('type-of(blue)') == calc('color')


def test_unit(calc):
    # Examples from the Ruby docs
    assert calc('unit(100)') == calc('""')
    assert calc('unit(100px)') == calc('"px"')
    assert calc('unit(3em)') == calc('"em"')
    assert calc('unit(10px * 5em)') == calc('"em*px"')
    # NOTE: the docs say "em*px/cm*rem", but even Ruby sass doesn't actually
    # return that
    assert calc('unit(10px * 5em / 30cm / 1rem)') == calc('"em/rem"')


def test_unitless(calc):
    # Examples from the Ruby docs
    assert calc('unitless(100)') == calc('true')
    assert calc('unitless(100px)') == calc('false')


def test_comparable(calc):
    # Examples from the Ruby docs
    assert calc('comparable(2px, 1px)') == calc('true')
    assert calc('comparable(100px, 3em)') == calc('false')
    assert calc('comparable(10cm, 3mm)') == calc('true')


# ------------------------------------------------------------------------------
# Miscellaneous functions

def test_if(calc):
    # Examples from the Ruby docs
    assert calc('if(true, 1px, 2px)') == calc('1px')
    assert calc('if(false, 1px, 2px)') == calc('2px')
