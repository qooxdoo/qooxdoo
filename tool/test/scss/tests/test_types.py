"""Tests for the type system."""

from scss.types import Color, Null, Number, String

import pytest


# Operators: arithmetic (+ - * / %), unary (+ -), comparison (== != < > <= >=), boolean
# Types: numbers, colors, strings, booleans, lists
# Test them all!

def test_addition():
    # Numbers are a little complicated, what with all the units
    # Simple case
    assert Number(123) + Number(456) == Number(579)
    # Simple equal units
    assert Number(1, "px") + Number(2, "px") == Number(3, "px")
    # Unitless values inherit units of the other operand
    assert Number(5) + Number(6, "px") == Number(11, "px")
    # Zero values can cast to any units
    assert Number(0, "in") + Number(24, "deg") == Number(24, "deg")
    # With different units, the left operand wins
    assert Number(10, "cm") + Number(100, "mm") == Number(20, "cm")
    assert Number(100, "mm") + Number(10, "cm") == Number(200, "mm")
    # Unconvertible units raise an error
    with pytest.raises(ValueError):
        Number(1, "px") + Number(1, "em")

    # Adding anything to a string makes a string
    assert Number(123) + String('abc') == String('123abc')
    assert String('abc') + Number(123) == String('abc123')

    ret = String('abc', quotes=None) + String('def', quotes=None)
    assert ret == String('abcdef')
    assert ret.quotes is None

    ret = String('abc', quotes='"') + String('def', quotes=None)
    assert ret == String('abcdef')
    assert ret.quotes is '"'

    ret = String('abc', quotes=None) + String('def', quotes='"')
    assert ret == String('abcdef')
    assert ret.quotes is None

    assert Color.from_hex('#010305') + Color.from_hex('#050301') == Color.from_hex('#060606')
    assert Color.from_name('white') + Color.from_name('white') == Color.from_name('white')


def test_subtraction():
    assert Number(123) - Number(456) == Number(-333)
    assert Number(456) - Number(123) == Number(333)
    # TODO test that subtracting e.g. strings doesn't work

    assert Color.from_hex('#0f0f0f') - Color.from_hex('#050505') == Color.from_hex('#0a0a0a')


def test_division():
    assert Number(5, "px") / Number(5, "px") == Number(1)
    assert Number(1, "in") / Number(6, "pt") == Number(12)


def test_comparison_numeric():
    lo = Number(123)
    hi = Number(456)
    assert lo < hi
    assert lo <= hi
    assert lo <= lo
    assert hi > lo
    assert hi >= lo
    assert hi >= hi
    assert lo == lo
    assert lo != hi

    # Same tests, negated
    assert not lo > hi
    assert not lo >= hi
    assert not hi < lo
    assert not hi <= lo
    assert not lo != lo
    assert not lo == hi

    # Numbers with units should also auto-cast numbers with units
    units = Number(123, "px")
    plain = Number(123)
    assert units == plain
    assert units <= plain
    assert units >= plain
    assert not units != plain
    assert not units < plain
    assert not units > plain

    # Incompatible units have...  rules.
    ems = Number(100, "em")
    pxs = Number(100, "px")

    with pytest.raises(ValueError):
        ems < pxs
    with pytest.raises(ValueError):
        ems > pxs
    with pytest.raises(ValueError):
        ems <= pxs
    with pytest.raises(ValueError):
        ems >= pxs

    assert not ems == pxs
    assert ems != pxs


def test_comparison_stringerific():
    abc = String('abc')
    xyz = String('xyz')

    assert abc == abc
    assert abc != xyz
    assert not abc == xyz
    assert not abc != abc

    # Interaction with other types
    assert Number(123) != String('123')
    assert String('123') != Number(123)

    # Sass strings don't support ordering
    with pytest.raises(TypeError):
        abc < xyz

    with pytest.raises(TypeError):
        abc <= xyz

    with pytest.raises(TypeError):
        abc > xyz

    with pytest.raises(TypeError):
        abc >= xyz

    with pytest.raises(TypeError):
        Number(123) < String('123')


def test_comparison_null():
    null = Null()

    assert null == null
    assert null != Number(0)

    with pytest.raises(TypeError):
        null < null


# TODO write more!  i'm lazy.
