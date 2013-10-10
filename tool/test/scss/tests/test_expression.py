"""Tests for expressions.  This test module is currently a bit ill-defined and
contains a variety of expression-related tests.
"""
from scss.errors import SassEvaluationError
from scss.expression import Calculator
from scss.functions.core import CORE_LIBRARY
from scss.rule import Namespace
from scss.types import Color, List, Null, Number, String

import pytest


@pytest.fixture
def calc():
    return Calculator().evaluate_expression


def assert_strict_string_eq(expected, actual):
    assert expected.value == actual.value
    assert expected.quotes == actual.quotes


def test_reference_operations():
    """Test the example expressions in the reference document:

    http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#operations
    """
    # TODO: break this into its own file and add the entire reference guide

    # Need to build the calculator manually to get at its namespace, and need
    # to use calculate() instead of evaluate_expression() so interpolation
    # works
    ns = Namespace(functions=CORE_LIBRARY)
    calc = Calculator(ns).calculate

    # Simple example
    assert calc('1in + 8pt') == Number(1.11111111, "in")

    # Division
    ns.set_variable('$width', Number(1000, "px"))
    ns.set_variable('$font-size', Number(12, "px"))
    ns.set_variable('$line-height', Number(30, "px"))
    assert calc('10px/8px') == String('10px / 8px')   # plain CSS; no division
    assert calc('$width/2') == Number(500, "px")      # uses a variable; does division
    assert calc('(500px/2)') == Number(250, "px")     # uses parens; does division
    assert calc('5px + 8px/2px') == Number(9, "px")   # uses +; does division
    # TODO: Ruby doesn't include these spaces
    assert calc('#{$font-size}/#{$line-height}') == String('12px / 30px')
                                            # uses #{}; does no division

    # Color operations
    ns.set_variable('$translucent-red', Color.from_rgb(1, 0, 0, 0.5))
    ns.set_variable('$green', Color.from_name('lime'))
    assert calc('#010203 + #040506') == Color.from_hex('#050709')
    assert calc('#010203 * 2') == Color.from_hex('#020406')
    assert calc('rgba(255, 0, 0, 0.75) + rgba(0, 255, 0, 0.75)') == Color.from_rgb(1, 1, 0, 0.75)
    assert calc('opacify($translucent-red, 0.3)') == Color.from_rgb(1, 0, 0, 0.8)
    assert calc('transparentize($translucent-red, 0.25)') == Color.from_rgb(1, 0, 0, 0.25)
    assert calc("progid:DXImageTransform.Microsoft.gradient(enabled='false', startColorstr='#{ie-hex-str($green)}', endColorstr='#{ie-hex-str($translucent-red)}')"
                ) == String.unquoted("progid:DXImageTransform.Microsoft.gradient(enabled='false', startColorstr='#FF00FF00', endColorstr='#80FF0000')")

    # String operations
    ns.set_variable('$value', Null())
    assert_strict_string_eq(calc('e + -resize'), String('e-resize', quotes=None))
    assert_strict_string_eq(calc('"Foo " + Bar'), String('Foo Bar', quotes='"'))
    assert_strict_string_eq(calc('sans- + "serif"'), String('sans-serif', quotes=None))
    assert calc('3px + 4px auto') == List([Number(7, "px"), String('auto', quotes=None)])
    assert_strict_string_eq(calc('"I ate #{5 + 10} pies!"'), String('I ate 15 pies!', quotes='"'))
    assert_strict_string_eq(calc('"I ate #{$value} pies!"'), String('I ate  pies!', quotes='"'))


def test_parse(calc):
    # Tests for some general parsing.

    assert calc('foo !important bar') == List([
        String('foo'), String('!important'), String('bar'),
    ])


def test_functions(calc):
    ns = Namespace(functions=CORE_LIBRARY)
    calc = Calculator(ns).calculate

    assert calc('grayscale(red)') == Color.from_rgb(0.5, 0.5, 0.5)
    assert calc('grayscale(1)') == String('grayscale(1)', quotes=None)  # Misusing css built-in functions (with scss counterpart)
    assert calc('skew(1)') == String('skew(1)', quotes=None)  # Missing css-only built-in functions
    with pytest.raises(SassEvaluationError):
        calc('unitless("X")')  # Misusing non-css built-in scss funtions


# TODO write more!  i'm lazy.
