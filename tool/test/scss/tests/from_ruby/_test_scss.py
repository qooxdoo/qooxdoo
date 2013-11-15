#encoding: utf8
"""Tests ported from the `scss/scss_test.rb` file in the original Ruby Sass
implementation.

Tests dependent on the Sass syntax have been included, but are not run.
"""
from __future__ import absolute_import
from __future__ import unicode_literals

from scss import Scss

import pytest


# TODO undupe
def render(source, **kwargs):
    compiler = Scss(scss_opts=dict(compress=False), **kwargs)
    css = compiler.compile(source)

    # TODO chumptastic hack; sass and pyscss have slightly different
    # "non-compressed" output
    import re
    css = re.sub(r'\n *[}]$', ' }', css)
    #css = re.sub(r'; [}]', ';\n  }', css)

    return css


  ## One-Line Comments

def test_one_line_comments():
    assert '''.foo {
  baz: bang; }
''' == render('''.foo {// bar: baz;}
  baz: bang; //}
}
''')
    assert '''.foo bar[val="//"] {
  baz: bang; }
''' == render('''.foo bar[val="//"] {
  baz: bang; //}
}
''')

  ## Script

def test_variables():
    assert '''blat {
  a: foo; }
''' == render('''$var: foo;

blat {a: $var}
''')
    assert '''foo {
  a: 2;
  b: 6; }
''' == render('''foo {
  $var: 2;
  $another-var: 4;
  a: $var;
  b: $var + $another-var;}
''')

def test_unicode_variables():
    assert '''blat {
  a: foo; }
''' == render('''$vär: foo;

blat {a: $vär}
''')

def test_guard_assign():
    assert '''foo {
  a: 1; }
''' == render('''$var: 1;
$var: 2 !default;

foo {a: $var}
''')
    assert '''foo {
  a: 2; }
''' == render('''$var: 2 !default;

foo {a: $var}
''')

def test_sass_script():
    assert '''foo {
  a: 3;
  b: -1;
  c: foobar;
  d: 12px; }
''' == render('''foo {
  a: 1 + 2;
  b: 1 - 2;
  c: foo + bar;
  d: floor(12.3px); }
''')

def test_debug_directive(recwarn):
    assert '''foo {
  a: b; }

bar {
  c: d; }
''' == render('''foo {a: b}
@debug "hello world!";
bar {c: d}
''')
    # XXX warning: "test_debug_directive_inline.scss:2 DEBUG: hello world!"


def test_warn_directive(recwarn):
    expected_warning = '''
WARNING: this is a warning
         on line 2 of test_warn_directive_inline.scss

WARNING: this is a mixin
         on line 1 of test_warn_directive_inline.scss, in `foo'
         from line 3 of test_warn_directive_inline.scss
'''
    assert '''bar {
  c: d; }
''' == render('''@mixin foo { @warn "this is a mixin";}
@warn "this is a warning";
bar {c: d; @include foo;}
''')

    # XXX warning: expected_warning


def test_for_directive():
    assert '''.foo {
  a: 1;
  a: 2;
  a: 3;
  a: 4; }
''' == render('''.foo {
  @for $var from 1 to 5 {a: $var;}
}
''')
    assert '''.foo {
  a: 1;
  a: 2;
  a: 3;
  a: 4;
  a: 5; }
''' == render('''.foo {
  @for $var from 1 through 5 {a: $var;}
}
''')

def test_if_directive():
    assert '''foo {
  a: b; }
''' == render('''@if "foo" == "foo" {foo {a: b}}
@if "foo" != "foo" {bar {a: b}}
''')
    assert '''bar {
  a: b; }
''' == render('''@if "foo" != "foo" {foo {a: b}}
@else if "foo" == "foo" {bar {a: b}}
@else if true {baz {a: b}}
''')
    assert '''bar {
  a: b; }
''' == render('''@if "foo" != "foo" {foo {a: b}}
@else {bar {a: b}}
''')

def test_comment_after_if_directive():
    assert '''foo {
  a: b;
  /* This is a comment */
  c: d; }
''' == render('''foo {
  @if true {a: b}
  /* This is a comment */
  c: d }
''')
    assert '''foo {
  a: b;
  /* This is a comment */
  c: d; }
''' == render('''foo {
  @if true {a: b}
  @else {x: y}
  /* This is a comment */
  c: d }
''')

def test_while_directive():
    assert '''.foo {
  a: 1;
  a: 2;
  a: 3;
  a: 4; }
''' == render('''$i: 1;

.foo {
  @while $i != 5 {
    a: $i;
    $i: $i + 1;
  }
}
''')

def test_each_directive():
    assert '''a {
  b: 1px;
  b: 2px;
  b: 3px;
  b: 4px; }

c {
  d: foo;
  d: bar;
  d: baz;
  d: bang; }
''' == render('''a {
  @each $number in 1px 2px 3px 4px {
    b: $number;
  }
}
c {
  @each $str in foo, bar, baz, bang {
    d: $str;
  }
}
''')

def test_css_import_directive():
    assert "@import url(foo.css);\n" == render('@import "foo.css";')
    assert "@import url(foo.css);\n" == render("@import 'foo.css';")
    assert "@import url(\"foo.css\");\n" == render('@import url("foo.css");')
    assert "@import url(\"foo.css\");\n" == render('@import url("foo.css");')
    assert "@import url(foo.css);\n" == render('@import url(foo.css);')


def test_media_import():
    assert "@import \"./fonts.sass\" all;\n" == render("@import \"./fonts.sass\" all;")


def test_dynamic_media_import():
    assert '''@import "foo" print and (-webkit-min-device-pixel-ratio-foo: 25);
''' == render('''$media: print;
$key: -webkit-min-device-pixel-ratio;
$value: 20;
@import "foo" \#{$media} and ($key + "-foo": $value + 5);
''')

def test_http_import():
    assert "@import \"http://fonts.googleapis.com/css?family=Droid+Sans\";\n" == \
      render("@import \"http://fonts.googleapis.com/css?family=Droid+Sans\";")


def test_import_with_interpolation():
    assert '''@import url("http://fonts.googleapis.com/css?family=Droid+Sans");
''' == render('''$family: unquote("Droid+Sans");
@import url("http://fonts.googleapis.com/css?family=\#{$family}");
''')

def test_url_import():
    assert "@import url(fonts.sass);\n" == render("@import url(fonts.sass);")


def test_block_comment_in_script():
    assert '''foo {
  a: 1bar; }
''' == render('''foo {a: 1 + /* flang */ bar}
''')

def test_line_comment_in_script():
    assert '''foo {
  a: 1blang; }
''' == render('''foo {a: 1 + // flang }
  blang }
''')

  ## Nested Rules

def test_nested_rules():
    assert '''foo bar {
  a: b; }
''' == render('''foo {bar {a: b}}
''')
    assert '''foo bar {
  a: b; }
foo baz {
  b: c; }
''' == render('''foo {
  bar {a: b}
  baz {b: c}}
''')
    assert '''foo bar baz {
  a: b; }
foo bang bip {
  a: b; }
''' == render('''foo {
  bar {baz {a: b}}
  bang {bip {a: b}}}
''')

def test_nested_rules_with_declarations():
    assert '''foo {
  a: b; }
  foo bar {
    c: d; }
''' == render('''foo {
  a: b;
  bar {c: d}}
''')
    assert '''foo {
  a: b; }
  foo bar {
    c: d; }
''' == render('''foo {
  bar {c: d}
  a: b}
''')
    assert '''foo {
  ump: nump;
  grump: clump; }
  foo bar {
    blat: bang;
    habit: rabbit; }
    foo bar baz {
      a: b; }
    foo bar bip {
      c: d; }
  foo bibble bap {
    e: f; }
''' == render('''foo {
  ump: nump;
  grump: clump;
  bar {
    blat: bang;
    habit: rabbit;
    baz {a: b}
    bip {c: d}}
  bibble {
    bap {e: f}}}
''')

def test_nested_rules_with_fancy_selectors():
    assert '''foo .bar {
  a: b; }
foo :baz {
  c: d; }
foo bang:bop {
  e: f; }
''' == render('''foo {
  .bar {a: b}
  :baz {c: d}
  bang:bop {e: f}}
''')

def test_almost_ambiguous_nested_rules_and_declarations():
    assert '''foo {
  bar: baz bang bop biddle woo look at all these elems; }
  foo bar:baz:bang:bop:biddle:woo:look:at:all:these:pseudoclasses {
    a: b; }
  foo bar:baz bang bop biddle woo look at all these elems {
    a: b; }
''' == render('''foo {
  bar:baz:bang:bop:biddle:woo:look:at:all:these:pseudoclasses {a: b};
  bar:baz bang bop biddle woo look at all these elems {a: b};
  bar:baz bang bop biddle woo look at all these elems; }
''')

def test_newlines_in_selectors():
    assert '''foo
bar {
  a: b; }
''' == render('''foo
bar {a: b}
''')
    assert '''foo baz,
foo bang,
bar baz,
bar bang {
  a: b; }
''' == render('''foo,
bar {
  baz,
  bang {a: b}}
''')
    assert '''foo
bar baz
bang {
  a: b; }
foo
bar bip bop {
  c: d; }
''' == render('''foo
bar {
  baz
  bang {a: b}

  bip bop {c: d}}
''')
    assert '''foo bang, foo bip
bop, bar
baz bang, bar
baz bip
bop {
  a: b; }
''' == render('''foo, bar
baz {
  bang, bip
  bop {a: b}}
''')

def test_trailing_comma_in_selector():
    assert '''#foo #bar,
#baz #boom {
  a: b; }

#bip #bop {
  c: d; }
''' == render('''#foo #bar,,
,#baz #boom, {a: b}

#bip #bop, ,, {c: d}
''')

def test_parent_selectors():
    assert '''foo:hover {
  a: b; }
bar foo.baz {
  c: d; }
''' == render('''foo {
  &:hover {a: b}
  bar &.baz {c: d}}
''')

def test_parent_selector_with_subject():
    assert '''bar foo.baz! .bip {
  a: b; }

bar foo bar.baz! .bip {
  c: d; }
''' == render('''foo {
  bar &.baz! .bip {a: b}}

foo bar {
  bar &.baz! .bip {c: d}}
''')

  ## Namespace Properties

def test_namespace_properties():
    assert '''foo {
  bar: baz;
  bang-bip: 1px;
  bang-bop: bar; }
''' == render('''foo {
  bar: baz;
  bang: {
    bip: 1px;
    bop: bar;}}
''')

def test_several_namespace_properties():
    assert '''foo {
  bar: baz;
  bang-bip: 1px;
  bang-bop: bar;
  buzz-fram: "foo";
  buzz-frum: moo; }
''' == render('''foo {
  bar: baz;
  bang: {
    bip: 1px;
    bop: bar;}
  buzz: {
    fram: "foo";
    frum: moo;
  }
}
''')

def test_nested_namespace_properties():
    assert '''foo {
  bar: baz;
  bang-bip: 1px;
  bang-bop: bar;
  bang-blat-baf: bort; }
''' == render('''foo {
  bar: baz;
  bang: {
    bip: 1px;
    bop: bar;
    blat:{baf:bort}}}
''')

def test_namespace_properties_with_value():
    assert '''foo {
  bar: baz;
    bar-bip: bop;
    bar-bing: bop; }
''' == render('''foo {
  bar: baz {
    bip: bop;
    bing: bop; }}
''')

def test_namespace_properties_with_script_value():
    assert '''foo {
  bar: bazbang;
    bar-bip: bop;
    bar-bing: bop; }
''' == render('''foo {
  bar: baz + bang {
    bip: bop;
    bing: bop; }}
''')

def test_no_namespace_properties_without_space():
    assert '''foo bar:baz {
  bip: bop; }
''' == render('''foo {
  bar:baz {
    bip: bop }}
''')

def test_no_namespace_properties_without_space_even_when_its_unambiguous():
    render('''
foo {
  bar:1px {
    bip: bop }}
''')

    assert e.message == '''
Invalid CSS: a space is required between a property and its definition
when it has other properties nested beneath it.
'''
    assert e.sass_line == 2


  ## Mixins

def test_basic_mixins():
    assert '''.foo {
  a: b; }
''' == render('''@mixin foo {
  .foo {a: b}}

@include foo;
''')
    assert '''bar {
  c: d; }
  bar .foo {
    a: b; }
''' == render('''@mixin foo {
  .foo {a: b}}

bar {
  @include foo;
  c: d; }
''')
    assert '''bar {
  a: b;
  c: d; }
''' == render('''@mixin foo {a: b}

bar {
  @include foo;
  c: d; }
''')

def test_mixins_with_empty_args():
    assert '''.foo {
  a: b; }
''' == render('''@mixin foo() {a: b}

.foo {@include foo();}
''')
    assert '''.foo {
  a: b; }
''' == render('''@mixin foo() {a: b}

.foo {@include foo;}
''')
    assert '''.foo {
  a: b; }
''' == render('''@mixin foo {a: b}

.foo {@include foo();}
''')

def test_mixins_with_args():
    assert '''.foo {
  a: bar; }
''' == render('''@mixin foo($a) {a: $a}

.foo {@include foo(bar)}
''')
    assert '''.foo {
  a: bar;
  b: 12px; }
''' == render('''@mixin foo($a, $b) {
  a: $a;
  b: $b; }

.foo {@include foo(bar, 12px)}
''')

  ## Functions

def test_basic_function():
    assert '''bar {
  a: 3; }
''' == render('''@function foo() {
  @return 1 + 2;
}

bar {
  a: foo();
}
''')

def test_function_args():
    assert '''bar {
  a: 3; }
''' == render('''@function plus($var1, $var2) {
  @return $var1 + $var2;
}

bar {
  a: plus(1, 2);
}
''')

  ## Var Args

def test_mixin_var_args():
    assert '''.foo {
  a: 1;
  b: 2, 3, 4; }
''' == render('''@mixin foo($a, $b...) {
  a: $a;
  b: $b;
}

.foo {@include foo(1, 2, 3, 4)}
''')

def test_mixin_empty_var_args():
    assert '''.foo {
  a: 1;
  b: 0; }
''' == render('''@mixin foo($a, $b...) {
  a: $a;
  b: length($b);
}

.foo {@include foo(1)}
''')

def test_mixin_var_args_act_like_list():
    assert '''.foo {
  a: 3;
  b: 3; }
''' == render('''@mixin foo($a, $b...) {
  a: length($b);
  b: nth($b, 2);
}

.foo {@include foo(1, 2, 3, 4)}
''')

def test_mixin_splat_args():
    assert '''.foo {
  a: 1;
  b: 2;
  c: 3;
  d: 4; }
''' == render('''@mixin foo($a, $b, $c, $d) {
  a: $a;
  b: $b;
  c: $c;
  d: $d;
}

$list: 2, 3, 4;
.foo {@include foo(1, $list...)}
''')

def test_mixin_splat_expression():
    assert '''.foo {
  a: 1;
  b: 2;
  c: 3;
  d: 4; }
''' == render('''@mixin foo($a, $b, $c, $d) {
  a: $a;
  b: $b;
  c: $c;
  d: $d;
}

.foo {@include foo(1, (2, 3, 4)...)}
''')

def test_mixin_splat_args_with_var_args():
    assert '''.foo {
  a: 1;
  b: 2, 3, 4; }
''' == render('''@mixin foo($a, $b...) {
  a: $a;
  b: $b;
}

$list: 2, 3, 4;
.foo {@include foo(1, $list...)}
''')

def test_mixin_splat_args_with_var_args_and_normal_args():
    assert '''.foo {
  a: 1;
  b: 2;
  c: 3, 4; }
''' == render('''@mixin foo($a, $b, $c...) {
  a: $a;
  b: $b;
  c: $c;
}

$list: 2, 3, 4;
.foo {@include foo(1, $list...)}
''')

def test_mixin_splat_args_with_var_args_preserves_separator():
    assert '''.foo {
  a: 1;
  b: 2 3 4 5; }
''' == render('''@mixin foo($a, $b...) {
  a: $a;
  b: $b;
}

$list: 3 4 5;
.foo {@include foo(1, 2, $list...)}
''')

def test_mixin_var_and_splat_args_pass_through_keywords():
    assert '''.foo {
  a: 3;
  b: 1;
  c: 2; }
''' == render('''@mixin foo($a...) {
  @include bar($a...);
}

@mixin bar($b, $c, $a) {
  a: $a;
  b: $b;
  c: $c;
}

.foo {@include foo(1, $c: 2, $a: 3)}
''')

def test_mixin_var_args_with_keyword():
    with pytest.raises(SyntaxError) as e:
        render('''
@mixin foo($a, $b...) {
  a: $a;
  b: $b;
}

.foo {@include foo($a: 1, 2, 3, 4)}
''')

    assert e.message == "Positional arguments must come before keyword arguments."


def test_mixin_keyword_for_var_arg():
    with pytest.raises(SyntaxError) as e:
        render('''
@mixin foo($a, $b...) {
  a: $a;
  b: $b;
}

.foo {@include foo(1, $b: 2 3 4)}
''')

    assert e.message == "Argument $b of mixin foo cannot be used as a named argument."


def test_mixin_keyword_for_unknown_arg_with_var_args():
    with pytest.raises(SyntaxError) as e:
        render('''
@mixin foo($a, $b...) {
  a: $a;
  b: $b;
}

.foo {@include foo(1, $c: 2 3 4)}
''')

    assert e.message == "Mixin foo doesn't have an argument named $c."


def test_function_var_args():
    assert '''.foo {
  val: "a: 1, b: 2, 3, 4"; }
''' == render('''@function foo($a, $b...) {
  @return "a: \#{$a}, b: \#{$b}";
}

.foo {val: foo(1, 2, 3, 4)}
''')

def test_function_empty_var_args():
    assert '''.foo {
  val: "a: 1, b: 0"; }
''' == render('''@function foo($a, $b...) {
  @return "a: \#{$a}, b: \#{length($b)}";
}

.foo {val: foo(1)}
''')

def test_function_var_args_act_like_list():
    assert '''.foo {
  val: "a: 3, b: 3"; }
''' == render('''@function foo($a, $b...) {
  @return "a: \#{length($b)}, b: \#{nth($b, 2)}";
}

.foo {val: foo(1, 2, 3, 4)}
''')

def test_function_splat_args():
    assert '''.foo {
  val: "a: 1, b: 2, c: 3, d: 4"; }
''' == render('''@function foo($a, $b, $c, $d) {
  @return "a: \#{$a}, b: \#{$b}, c: \#{$c}, d: \#{$d}";
}

$list: 2, 3, 4;
.foo {val: foo(1, $list...)}
''')

def test_function_splat_expression():
    assert '''.foo {
  val: "a: 1, b: 2, c: 3, d: 4"; }
''' == render('''@function foo($a, $b, $c, $d) {
  @return "a: \#{$a}, b: \#{$b}, c: \#{$c}, d: \#{$d}";
}

.foo {val: foo(1, (2, 3, 4)...)}
''')

def test_function_splat_args_with_var_args():
    assert '''.foo {
  val: "a: 1, b: 2, 3, 4"; }
''' == render('''@function foo($a, $b...) {
  @return "a: \#{$a}, b: \#{$b}";
}

$list: 2, 3, 4;
.foo {val: foo(1, $list...)}
''')

def test_function_splat_args_with_var_args_and_normal_args():
    assert '''.foo {
  val: "a: 1, b: 2, c: 3, 4"; }
''' == render('''@function foo($a, $b, $c...) {
  @return "a: \#{$a}, b: \#{$b}, c: \#{$c}";
}

$list: 2, 3, 4;
.foo {val: foo(1, $list...)}
''')

def test_function_splat_args_with_var_args_preserves_separator():
    assert '''.foo {
  val: "a: 1, b: 2 3 4 5"; }
''' == render('''@function foo($a, $b...) {
  @return "a: \#{$a}, b: \#{$b}";
}

$list: 3 4 5;
.foo {val: foo(1, 2, $list...)}
''')

def test_function_var_and_splat_args_pass_through_keywords():
    assert '''.foo {
  val: "a: 3, b: 1, c: 2"; }
''' == render('''@function foo($a...) {
  @return bar($a...);
}

@function bar($b, $c, $a) {
  @return "a: \#{$a}, b: \#{$b}, c: \#{$c}";
}

.foo {val: foo(1, $c: 2, $a: 3)}
''')

def test_function_var_args_with_keyword():
    with pytest.raises(SyntaxError) as e:
        render('''@function foo($a, $b...) {
  @return "a: \#{$a}, b: $b";
}

.foo {val: foo($a: 1, 2, 3, 4)}
''')

    assert e.message == "Positional arguments must come before keyword arguments."


def test_function_keyword_for_var_arg():
    with pytest.raises(SyntaxError) as e:
        render('''@function foo($a, $b...) {
  @return "a: \#{$a}, b: \#{$b}";
}

.foo {val: foo(1, $b: 2 3 4)}
''')

    assert e.message == "Argument $b of function foo cannot be used as a named argument."


def test_function_keyword_for_unknown_arg_with_var_args():
    with pytest.raises(SyntaxError) as e:
        render('''@function foo($a, $b...) {
  @return "a: \#{$a}, b: \#{$b}";
}

.foo {val: foo(1, $c: 2 3 4)}
''')

    assert e.message == "Function foo doesn't have an argument named $c."


def test_function_var_args_passed_to_native():
    assert '''.foo {
  val: #102035; }
''' == render('''@function foo($args...) {
  @return adjust-color($args...);
}

.foo {val: foo(#102030, $blue: 5)}
''')

  ## Interpolation

def test_basic_selector_interpolation():
    assert '''foo 3 baz {
  a: b; }
''' == render('''foo \#{1 + 2} baz {a: b}
''')
    assert '''foo.bar baz {
  a: b; }
''' == render('''foo\#{".bar"} baz {a: b}
''')
    assert '''foo.bar baz {
  a: b; }
''' == render('''\#{"foo"}.bar baz {a: b}
''')

def test_selector_only_interpolation():
    assert '''foo bar {
  a: b; }
''' == render('''\#{"foo" + " bar"} {a: b}
''')

def test_selector_interpolation_before_element_name():
    assert '''foo barbaz {
  a: b; }
''' == render('''\#{"foo" + " bar"}baz {a: b}
''')

def test_selector_interpolation_in_string():
    assert '''foo[val="bar foo bar baz"] {
  a: b; }
''' == render('''foo[val="bar \#{"foo" + " bar"} baz"] {a: b}
''')

def test_selector_interpolation_in_pseudoclass():
    assert '''foo:nth-child(5n) {
  a: b; }
''' == render('''foo:nth-child(\#{5 + "n"}) {a: b}
''')

def test_selector_interpolation_at_class_begininng():
    assert '''.zzz {
  a: b; }
''' == render('''$zzz: zzz;
.\#{$zzz} { a: b; }
''')

def test_selector_interpolation_at_id_begininng():
    assert '''#zzz {
  a: b; }
''' == render('''$zzz: zzz;
#\#{$zzz} { a: b; }
''')

def test_selector_interpolation_at_pseudo_begininng():
    assert ''':zzz::zzz {
  a: b; }
''' == render('''$zzz: zzz;
:\#{$zzz}::\#{$zzz} { a: b; }
''')

def test_selector_interpolation_at_attr_beginning():
    assert '''[zzz=foo] {
  a: b; }
''' == render('''$zzz: zzz;
[\#{$zzz}=foo] { a: b; }
''')

def test_selector_interpolation_at_attr_end():
    assert '''[foo=zzz] {
  a: b; }
''' == render('''$zzz: zzz;
[foo=\#{$zzz}] { a: b; }
''')

def test_selector_interpolation_at_dashes():
    assert '''div {
  -foo-a-b-foo: foo; }
''' == render('''$a : a;
$b : b;
div { -foo-\#{$a}-\#{$b}-foo: foo }
''')

def test_selector_interpolation_in_reference_combinator():
    assert '''.foo /a/ .bar /b|c/ .baz {
  a: b; }
''' == render('''$a: a;
$b: b;
$c: c;
.foo /\#{$a}/ .bar /\#{$b}|\#{$c}/ .baz {a: b}
''')

def test_parent_selector_with_parent_and_subject():
    assert '''bar foo.baz! .bip {
  c: d; }
''' == render('''$subject: "!";
foo {
  bar &.baz\#{$subject} .bip {c: d}}
''')

def test_basic_prop_name_interpolation():
    assert '''foo {
  barbazbang: blip; }
''' == render('''foo {bar\#{"baz" + "bang"}: blip}
''')
    assert '''foo {
  bar3: blip; }
''' == render('''foo {bar\#{1 + 2}: blip}
''')

def test_prop_name_only_interpolation():
    assert '''foo {
  bazbang: blip; }
''' == render('''foo {\#{"baz" + "bang"}: blip}
''')

def test_directive_interpolation():
    assert '''@foo bar12 qux {
  a: b; }
''' == render('''$baz: 12;
@foo bar\#{$baz} qux {a: b}
''')

def test_media_interpolation():
    assert '''@media bar12 {
  a: b; }
''' == render('''$baz: 12;
@media bar\#{$baz} {a: b}
''')

def test_script_in_media():
    assert '''@media screen and (-webkit-min-device-pixel-ratio: 20), only print {
  a: b; }
''' == render('''$media1: screen;
$media2: print;
$var: -webkit-min-device-pixel-ratio;
$val: 20;
@media \#{$media1} and ($var: $val), only \#{$media2} {a: b}
''')
    assert '''@media screen and (-webkit-min-device-pixel-ratio: 13) {
  a: b; }
''' == render('''$vals: 1 2 3;
@media screen and (-webkit-min-device-pixel-ratio: 5 + 6 + nth($vals, 2)) {a: b}
''')

def test_media_interpolation_with_reparse():
    assert '''@media screen and (max-width: 300px) {
  a: b; }
@media screen and (max-width: 300px) {
  a: b; }
@media screen and (max-width: 300px) {
  a: b; }
@media screen and (max-width: 300px), print and (max-width: 300px) {
  a: b; }
''' == render('''$constraint: "(max-width: 300px)";
$fragment: "nd \#{$constraint}";
$comma: "een, pri";
@media screen and \#{$constraint} {a: b}
@media screen {
  @media \#{$constraint} {a: b}
}
@media screen a\#{$fragment} {a: b}
@media scr\#{$comma}nt {
  @media \#{$constraint} {a: b}
}
''')

def test_moz_document_interpolation():
    assert '''@-moz-document url(http://sass-lang.com/),
               url-prefix(http://sass-lang.com/docs),
               domain(sass-lang.com),
               domain("sass-lang.com") {
  .foo {
    a: b; } }
''' == render('''$domain: "sass-lang.com";
@-moz-document url(http://\#{$domain}/),
               url-prefix(http://\#{$domain}/docs),
               domain(\#{$domain}),
               \#{domain($domain)} {
  .foo {a: b}
}
''')

def test_supports_with_expressions():
    assert '''@supports (feature1: val) and (feature2: val) or (not (feature23: val4)) {
  foo {
    a: b; } }
''' == render('''$query: "(feature1: val)";
$feature: feature2;
$val: val;
@supports \#{$query} and ($feature: $val) or (not ($feature + 3: $val + 4)) {
  foo {a: b}
}
''')

def test_supports_bubbling():
    assert '''@supports (foo: bar) {
  a {
    b: c; }
    @supports (baz: bang) {
      a {
        d: e; } } }
''' == render('''a {
  @supports (foo: bar) {
    b: c;
    @supports (baz: bang) {
      d: e;
    }
  }
}
''')

def test_random_directive_interpolation():
    assert '''@foo url(http://sass-lang.com/),
     domain("sass-lang.com"),
     "foobarbaz",
     foobarbaz {
  .foo {
    a: b; } }
''' == render('''$domain: "sass-lang.com";
@foo url(http://\#{$domain}/),
     \#{domain($domain)},
     "foo\#{'ba' + 'r'}baz",
     foo\#{'ba' + 'r'}baz {
  .foo {a: b}
}
''')

def test_nested_mixin_def():
    assert '''foo {
  a: b; }
''' == render('''foo {
  @mixin bar {a: b}
  @include bar; }
''')

def test_nested_mixin_shadow():
    assert '''foo {
  c: d; }

baz {
  a: b; }
''' == render('''@mixin bar {a: b}

foo {
  @mixin bar {c: d}
  @include bar;
}

baz {@include bar}
''')

def test_nested_function_def():
    assert '''foo {
  a: 1; }

bar {
  b: foo(); }
''' == render('''foo {
  @function foo() {@return 1}
  a: foo(); }

bar {b: foo()}
''')

def test_nested_function_shadow():
    assert '''foo {
  a: 2; }

baz {
  b: 1; }
''' == render('''@function foo() {@return 1}

foo {
  @function foo() {@return 2}
  a: foo();
}

baz {b: foo()}
''')

  ## Errors

def test_nested_mixin_def_is_scoped():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  @mixin bar {a: b}}
bar {@include bar}
''')

    assert e.sass_line == 3
    assert e.message == "Undefined mixin 'bar'."


def test_rules_beneath_properties():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  bar: {
    baz {
      bang: bop }}}
''')

    assert e.message == 'Illegal nesting: Only properties may be nested beneath properties.'
    assert e.sass_line == 3


def test_uses_property_exception_with_star_hack():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  *bar:baz [fail]; }
''')

    assert e.message == 'Invalid CSS after "  *bar:baz ": expected ";", was "[fail]; }"'
    assert e.sass_line == 2


def test_uses_property_exception_with_colon_hack():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  :bar:baz [fail]; }
''')

    assert e.message == 'Invalid CSS after "  :bar:baz ": expected ";", was "[fail]; }"'
    assert e.sass_line == 2


def test_uses_rule_exception_with_dot_hack():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  .bar:baz <fail>; }
''')

    assert e.message == 'Invalid CSS after "  .bar:baz ": expected "{", was "<fail>; }"'
    assert e.sass_line == 2


def test_uses_property_exception_with_space_after_name():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  bar: baz [fail]; }
''')

    assert e.message == 'Invalid CSS after "  bar: baz ": expected ";", was "[fail]; }"'
    assert e.sass_line == 2


def test_uses_property_exception_with_non_identifier_after_name():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  bar:1px [fail]; }
''')

    assert e.message == 'Invalid CSS after "  bar:1px ": expected ";", was "[fail]; }"'
    assert e.sass_line == 2


def test_uses_property_exception_when_followed_by_open_bracket():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  bar:{baz: .fail} }
''')

    assert e.message == 'Invalid CSS after "  bar:{baz: ": expected expression (e.g. 1px, bold), was ".fail} }"'
    assert e.sass_line == 2


def test_script_error():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  bar: "baz" * * }
''')

    assert e.message == 'Invalid CSS after "  bar: "baz" * ": expected expression (e.g. 1px, bold), was "* }"'
    assert e.sass_line == 2


def test_multiline_script_syntax_error():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  bar:
    "baz" * * }
''')

    assert e.message == 'Invalid CSS after "    "baz" * ": expected expression (e.g. 1px, bold), was "* }"'
    assert e.sass_line == 3


def test_multiline_script_runtime_error():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  bar: "baz" +
    "bar" +
    $bang }
''')

    assert e.message == "Undefined variable: \"$bang\"."
    assert e.sass_line == 4


def test_post_multiline_script_runtime_error():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  bar: "baz" +
    "bar" +
    "baz";
  bip: $bop; }
''')

    assert e.message == "Undefined variable: \"$bop\"."
    assert e.sass_line == 5


def test_multiline_property_runtime_error():
    with pytest.raises(SyntaxError) as e:
        render('''foo {
  bar: baz
    bar
    \#{$bang} }
''')

    assert e.message == "Undefined variable: \"$bang\"."
    assert e.sass_line == 4


def test_post_resolution_selector_error():
    with pytest.raises(SyntaxError) as e:
        render("\n\nfoo \#{\") bar\"} {a: b}")

    assert e.message == 'Invalid CSS after "foo ": expected selector, was ") bar"'
    assert e.sass_line == 3


def test_parent_in_mid_selector_error():
    with pytest.raises(SyntaxError) as e:
        render('''flim {
  .foo&.bar {a: b}
}
''')

    assert e.message == '''Invalid CSS after "  .foo": expected "{", was "&.bar {a: b}"

"&.bar" may only be used at the beginning of a selector.'''


def test_parent_after_selector_error():
    with pytest.raises(SyntaxError) as e:
        render('''flim {
  .foo.bar& {a: b}
}
''')

    assert e.message == '''Invalid CSS after "  .foo.bar": expected "{", was "& {a: b}"

"&" may only be used at the beginning of a selector.'''


def test_double_parent_selector_error():
    with pytest.raises(SyntaxError) as e:
        render('''flim {
  && {a: b}
}
''')

    assert e.message == '''Invalid CSS after "  &": expected "{", was "& {a: b}"

"&" may only be used at the beginning of a selector.'''


def test_no_lonely_else():
    with pytest.raises(SyntaxError) as e:
        render('''@else {foo: bar}
''')

    assert e.message == '''Invalid CSS: @else must come after @if'''


  # Regression

def test_reference_combinator_with_parent_ref():
    assert '''a /foo/ b {
  c: d; }
''' == render('''a {& /foo/ b {c: d}}
''')

def test_newline_selector_rendered_multiple_times():
    assert '''form input,
form select {
  color: white; }

form input,
form select {
  color: white; }
''' == render('''@for $i from 1 through 2 {
  form {
    input,
    select {
      color: white;
    }
  }
}
''')

def test_prop_name_interpolation_after_hyphen():
    assert '''a {
  -foo-bar: b; }
''' == render('''a { -\#{"foo"}-bar: b; }
''')

def test_star_plus_and_parent():
    assert '''* + html foo {
  a: b; }
''' == render('''foo {*+html & {a: b}}
''')

def test_weird_added_space():
    assert '''foo {
  bar: -moz-bip; }
''' == render('''$value : bip;

foo {
  bar: -moz-\#{$value};
}
''')

def test_interpolation_with_bracket_on_next_line():
    assert '''a.foo b {
  color: red; }
''' == render('''a.\#{"foo"} b
{color: red}
''')

def test_extra_comma_in_mixin_arglist_error():
    with pytest.raises(SyntaxError) as e:
        render('''@mixin foo($a1, $a2) {
  baz: $a1 $a2;
}

.bar {
  @include foo(bar, );
}
''')

    assert e.message == '''Invalid CSS after "...clude foo(bar, ": expected mixin argument, was ");"'''


def test_interpolation():
    assert '''ul li#foo a span.label {
  foo: bar; }
''' == render('''$bar : "#foo";
ul li\#{$bar} a span.label { foo: bar; }
''')

def test_mixin_with_keyword_args():
    assert '''.mixed {
  required: foo;
  arg1: default-val1;
  arg2: non-default-val2; }
''' == render('''@mixin a-mixin($required, $arg1: default-val1, $arg2: default-val2) {
  required: $required;
  arg1: $arg1;
  arg2: $arg2;
}
.mixed { @include a-mixin(foo, $arg2: non-default-val2); }
''')

def test_passing_required_args_as_a_keyword_arg():
    assert '''.mixed {
  required: foo;
  arg1: default-val1;
  arg2: default-val2; }
''' == render('''@mixin a-mixin($required, $arg1: default-val1, $arg2: default-val2) {
  required: $required;
  arg1: $arg1;
  arg2: $arg2; }
.mixed { @include a-mixin($required: foo); }
''')

def test_passing_all_as_keyword_args_in_opposite_order():
    assert '''.mixed {
  required: foo;
  arg1: non-default-val1;
  arg2: non-default-val2; }
''' == render('''@mixin a-mixin($required, $arg1: default-val1, $arg2: default-val2) {
  required: $required;
  arg1: $arg1;
  arg2: $arg2; }
.mixed { @include a-mixin($arg2: non-default-val2, $arg1: non-default-val1, $required: foo); }
''')

def test_keyword_args_in_functions():
    assert '''.keyed {
  color: rgba(170, 119, 204, 0.4); }
''' == render('''.keyed { color: rgba($color: #a7c, $alpha: 0.4) }
''')

def test_unknown_keyword_arg_raises_error():
    with pytest.raises(SyntaxError) as e:
        render('''@mixin a($b: 1) { a: $b; }
div { @include a(1, $c: 3); }
''')

    assert e.message == "Mixin a doesn't have an argument named $c."



def test_newlines_removed_from_selectors_when_compressed():
    assert '''z a,z b{display:block}
''' == render('''a
, b {
  z & {
    display: block;
  }
}
''', style='compressed')


def test_if_error_line():
    with pytest.raises(SyntaxError) as e:
        render('''@if true {foo: bar}
}''')

    assert e.sass_line == 2


def test_multiline_var():
    assert '''foo {
  a: 3;
  b: false;
  c: a b c; }
''' == render('''foo {
  $var1: 1 +
    2;
  $var2: true and
    false;
  $var3: a b
    c;
  a: $var1;
  b: $var2;
  c: $var3; }
''')

def test_mixin_content():
    assert '''.parent {
  background-color: red;
  border-color: red; }
  .parent .child {
    background-color: yellow;
    color: blue;
    border-color: yellow; }
''' == render('''$color: blue;
@mixin context($class, $color: red) {
  .\#{$class} {
    background-color: $color;
    @content;
    border-color: $color;
  }
}
@include context(parent) {
  @include context(child, $color: yellow) {
    color: $color;
  }
}
''')

def test_empty_content():
    assert '''a {
  b: c; }
''' == render('''@mixin foo { @content }
a { b: c; @include foo {} }
''')

def test_options_passed_to_script():
    assert '''foo{color:#000}
''' == render('''foo {color: darken(black, 10%)}
''', style='compressed')


  # ref: https://github.com/nex3/sass/issues/104
def test_no_buffer_overflow():
    template = '''.aaa {
  background-color: white;
}
.aaa .aaa .aaa {
  background-color: black;
}
.bbb {
  @extend .aaa;
}
.xxx {
  @extend .bbb;
}
.yyy {
  @extend .bbb;
}
.zzz {
  @extend .bbb;
}
'''

    scss.Parser(template, "test.scss").parse()
