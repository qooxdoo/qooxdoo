"""Tests for miscellaneous features that should maybe be broken out into their
own files, maybe.
"""

from scss import Scss


def test_super_selector():
    compiler = Scss(scss_opts=dict(style='expanded'))
    input = """\
foo, bar {
  a: b;
}
baz {
  c: d;
}
"""
    expected = """\
super foo, super bar {
  a: b;
}

super baz {
  c: d;
}
"""

    output = compiler.compile(input, super_selector='super')
    assert expected == output


def test_debug_info():
    # nb: debug info doesn't work if the source isn't a file
    compiler = Scss(scss_opts=dict(style='expanded', debug_info=True))
    compiler._scss_files = {}
    compiler._scss_files['input.css'] = """\
div {
    color: green;
}
table {
    color: red;
}
"""
    expected = """\
@media -sass-debug-info{filename{font-family:file\:\/\/input\.css}line{font-family:\\000031}}
div {
  color: green;
}

@media -sass-debug-info{filename{font-family:file\:\/\/input\.css}line{font-family:\\000034}}
table {
  color: red;
}
"""

    output = compiler.compile()
    assert expected == output


def test_live_errors():
    compiler = Scss(live_errors=True)
    output = compiler.compile("""$foo: unitless(one);""")
    assert "body:before" in output
    assert "TypeError: Expected" in output


def test_extend_across_files():
    compiler = Scss(scss_opts=dict(compress=0))
    compiler._scss_files = {}
    compiler._scss_files['first.css'] = '''
    @option style:legacy, short_colors:yes, reverse_colors:yes;
    .specialClass extends .basicClass {
        padding: 10px;
        font-size: 14px;
    }
    '''
    compiler._scss_files['second.css'] = '''
    @option style:legacy, short_colors:yes, reverse_colors:yes;
    .basicClass {
        padding: 20px;
        background-color: #FF0000;
    }
    '''
    actual = compiler.compile()
    expected = """\
.basicClass, .specialClass {
  padding: 20px;
  background-color: #FF0000;
}
.specialClass {
  padding: 10px;
  font-size: 14px;
}
"""

    assert expected == actual
