"""Tests for Compass gradient generation."""

from scss.expression import Calculator
from scss.functions.compass.gradients import COMPASS_GRADIENTS_LIBRARY, linear_gradient
from scss.rule import Namespace
from scss.types import String, List, Number, Color

import pytest


@pytest.fixture
def calc():
    ns = Namespace(functions=COMPASS_GRADIENTS_LIBRARY)
    return Calculator(ns).evaluate_expression


def test_linear_gradient():
    # Set up some values
    to = String.unquoted('to')
    bottom = String.unquoted('bottom')
    left = String.unquoted('left')
    angle = Number(45, 'deg')

    red = Color.from_name('red')
    blue = Color.from_name('blue')

    start = Number(0, "%")
    middle = Number(50, "%")
    end = Number(100, "%")

    assert (
        linear_gradient(left, List((red, start)), List((blue, middle)))
        == String('linear-gradient(left, red, blue 50%)')
    )

    assert (
        linear_gradient(List((to, bottom)), blue, List((red, end)))
        == String('linear-gradient(to bottom, blue, red)')
    )


@pytest.mark.xfail('True', reason="rainbow still has intermediate values added")
def test_linear_gradient_idempotent(calc):
    # linear-gradient should leave valid syntax alone.
    # Examples graciously stolen from MDN:
    # https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient
    trials = [
        'linear-gradient(45deg, blue, red)',
        'linear-gradient(to left top, blue, red)',
        'linear-gradient(0deg, blue, green 40%, red)',
        'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
        'linear-gradient(to bottom right, red, rgba(255,0,0,0))',
        'linear-gradient(to bottom, hsl(0, 80%, 70%), #bada55)',
    ]

    for trial in trials:
        assert calc(trial) == String(trial)
