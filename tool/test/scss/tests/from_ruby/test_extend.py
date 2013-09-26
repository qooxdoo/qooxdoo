from __future__ import absolute_import
from __future__ import unicode_literals

from scss import Scss

import pytest

# py.test bug: unicode literals not allowed here, so cast to native str type
pytestmark = pytest.mark.skipif(str("not config.getoption('include_ruby')"))

# TODO undupe
def assert_rendering(input, expected, **kwargs):
    compiler = Scss(scss_opts=dict(compress=False), **kwargs)
    css = compiler.compile(input)

    # TODO chumptastic hack; sass and pyscss have slightly different
    # "non-compressed" output
    import re
    css = re.sub(r'(?m)\n *[}]$', ' }\n', css).rstrip("\n") + "\n"
    #css = re.sub(r'; [}]', ';\n  }', css)
    #css = re.sub(r'\n *[}]$', ' }', css)

    assert expected == css

def test_basic():
    assert_rendering('''\
.foo {a: b}
.bar {@extend .foo}
''', '''\
.foo, .bar {
  a: b; }
''')

    assert_rendering('''\
.bar {@extend .foo}
.foo {a: b}
''', '''\
.foo, .bar {
  a: b; }
''')

    assert_rendering('''\
.foo {a: b}
.bar {c: d; @extend .foo}
''', '''\
.foo, .bar {
  a: b; }

.bar {
  c: d; }
''')

    assert_rendering('''\
.foo {a: b}
.bar {@extend .foo; c: d}
''', '''\
.foo, .bar {
  a: b; }

.bar {
  c: d; }
''')

def test_multiple_targets():
    assert_rendering('''\
.foo {a: b}
.bar {@extend .foo}
.blip .foo {c: d}
''', '''\
.foo, .bar {
  a: b; }

.blip .foo, .blip .bar {
  c: d; }
''')

def test_multiple_extendees():
    assert_rendering('''\
.foo {a: b}
.bar {c: d}
.baz {@extend .foo; @extend .bar}
''', '''\
.foo, .baz {
  a: b; }

.bar, .baz {
  c: d; }
''')

def test_multiple_extends_with_single_extender_and_single_target():
    assert_extends(
        '.foo .bar',
        '.baz {@extend .foo; @extend .bar}',
        '.foo .bar, .baz .bar, .foo .baz, .baz .baz')
    assert_extends(
        '.foo.bar',
        '.baz {@extend .foo; @extend .bar}',
        '.foo.bar, .baz')

def test_multiple_extends_with_multiple_extenders_and_single_target():
    assert_rendering('''\
.foo .bar {a: b}
.baz {@extend .foo}
.bang {@extend .bar}
''', '''\
.foo .bar, .baz .bar, .foo .bang, .baz .bang {
  a: b; }
''')

    assert_rendering('''\
.foo.bar {a: b}
.baz {@extend .foo}
.bang {@extend .bar}
''', '''\
.foo.bar, .bar.baz, .baz.bang, .foo.bang {
  a: b; }
''')

def test_chained_extends():
    assert_rendering('''\
.foo {a: b}
.bar {@extend .foo}
.baz {@extend .bar}
.bip {@extend .bar}
''', '''\
.foo, .bar, .baz, .bip {
  a: b; }
''')

def test_dynamic_extendee():
    assert_extends(
        '.foo',
        '.bar {@extend #{".foo"}}',
        '.foo, .bar')
    assert_extends(
        '[baz^="blip12px"]',
        '.bar {@extend [baz^="blip#{12px}"]}',
        '[baz^="blip12px"], .bar')

def test_nested_target():
    assert_extends(
        '.foo .bar',
        '.baz {@extend .bar}',
        '.foo .bar, .foo .baz')

def test_target_with_child():
    assert_extends(
        '.foo .bar',
        '.baz {@extend .foo}',
        '.foo .bar, .baz .bar')

def test_class_unification():
    assert_unification(
        '.foo.bar',
        '.baz {@extend .foo}',
        '.foo.bar, .bar.baz')
    assert_unification(
        '.foo.baz',
        '.baz {@extend .foo}',
        '.baz')

def test_id_unification():
    assert_unification(
        '.foo.bar',
        '#baz {@extend .foo}',
        '.foo.bar, .bar#baz')
    assert_unification(
        '.foo#baz',
        '#baz {@extend .foo}',
        '#baz')

    # XXX assert_extend_doesnt_match('#bar', '.foo', :failed_to_unify, 2) do
    assert_unification(
        '.foo#baz',
        '#bar {@extend .foo}',
        '.foo#baz')

def test_universal_unification_with_simple_target():
    assert_unification(
        '.foo',
        '* {@extend .foo}',
        '.foo, *')
    assert_unification(
        '.foo',
        '*|* {@extend .foo}',
        '.foo, *|*')
    assert_unification(
        '.foo.bar',
        '* {@extend .foo}',
        '.bar')
    assert_unification(
        '.foo.bar',
        '*|* {@extend .foo}',
        '.bar')
    assert_unification(
        '.foo.bar',
        'ns|* {@extend .foo}',
        '.foo.bar, ns|*.bar')

def test_universal_unification_with_namespaceless_universal_target():
    assert_unification(
        '*.foo',
        '* {@extend .foo}',
        '*')
    assert_unification(
        '*.foo',
        '*|* {@extend .foo}',
        '*')
    assert_unification(
        '*|*.foo',
        '* {@extend .foo}',
        '*|*.foo, *')
    assert_unification(
        '*|*.foo',
        '*|* {@extend .foo}',
        '*|*')
    assert_unification(
        '*.foo',
        'ns|* {@extend .foo}',
        '*.foo, ns|*')
    assert_unification(
        '*|*.foo',
        'ns|* {@extend .foo}',
        '*|*.foo, ns|*')

def test_universal_unification_with_namespaced_universal_target():
    assert_unification(
        'ns|*.foo',
        '* {@extend .foo}',
        'ns|*')
    assert_unification(
        'ns|*.foo',
        '*|* {@extend .foo}',
        'ns|*')

    # XXX assert_extend_doesnt_match('ns2|*', '.foo', :failed_to_unify, 2) do
    assert_unification(
        'ns1|*.foo',
        'ns2|* {@extend .foo}',
        'ns1|*.foo')

    assert_unification(
        'ns|*.foo',
        'ns|* {@extend .foo}',
        'ns|*')

def test_universal_unification_with_namespaceless_element_target():
    assert_unification(
        'a.foo',
        '* {@extend .foo}',
        'a')
    assert_unification(
        'a.foo',
        '*|* {@extend .foo}',
        'a')
    assert_unification(
        '*|a.foo',
        '* {@extend .foo}',
        '*|a.foo, a')
    assert_unification(
        '*|a.foo',
        '*|* {@extend .foo}',
        '*|a')
    assert_unification(
        'a.foo',
        'ns|* {@extend .foo}',
        'a.foo, ns|a')
    assert_unification(
        '*|a.foo',
        'ns|* {@extend .foo}',
        '*|a.foo, ns|a')

def test_universal_unification_with_namespaced_element_target():
    assert_unification(
        'ns|a.foo',
        '* {@extend .foo}',
        'ns|a')
    assert_unification(
        'ns|a.foo',
        '*|* {@extend .foo}',
        'ns|a')

    # XXX assert_extend_doesnt_match('ns2|*', '.foo', :failed_to_unify, 2) do
    assert_unification(
        'ns1|a.foo',
        'ns2|* {@extend .foo}',
        'ns1|a.foo')

    assert_unification(
        'ns|a.foo',
        'ns|* {@extend .foo}',
        'ns|a')

def test_element_unification_with_simple_target():
    assert_unification(
        '.foo',
        'a {@extend .foo}',
        '.foo, a')
    assert_unification(
        '.foo.bar',
        'a {@extend .foo}',
        '.foo.bar, a.bar')
    assert_unification(
        '.foo.bar',
        '*|a {@extend .foo}',
        '.foo.bar, *|a.bar')
    assert_unification(
        '.foo.bar',
        'ns|a {@extend .foo}',
        '.foo.bar, ns|a.bar')

def test_element_unification_with_namespaceless_universal_target():
    assert_unification(
        '*.foo',
        'a {@extend .foo}',
        '*.foo, a')
    assert_unification(
        '*.foo',
        '*|a {@extend .foo}',
        '*.foo, a')
    assert_unification(
        '*|*.foo',
        'a {@extend .foo}',
        '*|*.foo, a')
    assert_unification(
        '*|*.foo',
        '*|a {@extend .foo}',
        '*|*.foo, *|a')
    assert_unification(
        '*.foo',
        'ns|a {@extend .foo}',
        '*.foo, ns|a')
    assert_unification(
        '*|*.foo',
        'ns|a {@extend .foo}',
        '*|*.foo, ns|a')

def test_element_unification_with_namespaced_universal_target():
    assert_unification(
        'ns|*.foo',
        'a {@extend .foo}',
        'ns|*.foo, ns|a')
    assert_unification(
        'ns|*.foo',
        '*|a {@extend .foo}',
        'ns|*.foo, ns|a')

    # XXX assert_extend_doesnt_match('ns2|a', '.foo', :failed_to_unify, 2) do
    assert_unification(
        'ns1|*.foo',
        'ns2|a {@extend .foo}',
        'ns1|*.foo')

    assert_unification(
        'ns|*.foo',
        'ns|a {@extend .foo}',
        'ns|*.foo, ns|a')

def test_element_unification_with_namespaceless_element_target():
    assert_unification(
        'a.foo',
        'a {@extend .foo}',
        'a')
    assert_unification(
        'a.foo',
        '*|a {@extend .foo}',
        'a')
    assert_unification(
        '*|a.foo',
        'a {@extend .foo}',
        '*|a.foo, a')
    assert_unification(
        '*|a.foo',
        '*|a {@extend .foo}',
        '*|a')
    assert_unification(
        'a.foo',
        'ns|a {@extend .foo}',
        'a.foo, ns|a')
    assert_unification(
        '*|a.foo',
        'ns|a {@extend .foo}',
        '*|a.foo, ns|a')

    # XXX assert_extend_doesnt_match('h1', '.foo', :failed_to_unify, 2) do
    assert_unification(
        'a.foo',
        'h1 {@extend .foo}',
        'a.foo')

def test_element_unification_with_namespaced_element_target():
    assert_unification(
        'ns|a.foo',
        'a {@extend .foo}',
        'ns|a')
    assert_unification(
        'ns|a.foo',
        '*|a {@extend .foo}',
        'ns|a')

    # XXX assert_extend_doesnt_match('ns2|a', '.foo', :failed_to_unify, 2) do
    assert_unification(
        'ns1|a.foo',
        'ns2|a {@extend .foo}',
        'ns1|a.foo')

    assert_unification(
        'ns|a.foo',
        'ns|a {@extend .foo}',
        'ns|a')

def test_attribute_unification():
    assert_unification(
        '[foo=bar].baz',
        '[foo=baz] {@extend .baz}',
        '[foo=bar].baz, [foo=bar][foo=baz]')
    assert_unification(
        '[foo=bar].baz',
        '[foo^=bar] {@extend .baz}',
        '[foo=bar].baz, [foo=bar][foo^=bar]')
    assert_unification(
        '[foo=bar].baz',
        '[foot=bar] {@extend .baz}',
        '[foo=bar].baz, [foo=bar][foot=bar]')
    assert_unification(
        '[foo=bar].baz',
        '[ns|foo=bar] {@extend .baz}',
        '[foo=bar].baz, [foo=bar][ns|foo=bar]')
    assert_unification(
        '%-a [foo=bar].bar',
        '[foo=bar] {@extend .bar}',
        '-a [foo=bar]')

def test_pseudo_unification():
    assert_unification(
        ':foo.baz',
        ':foo(2n+1) {@extend .baz}',
        ':foo.baz, :foo:foo(2n+1)')
    assert_unification(
        ':foo.baz',
        '::foo {@extend .baz}',
        ':foo.baz, :foo::foo')

    # XXX assert_extend_doesnt_match('::bar', '.baz', :failed_to_unify, 2) do
    assert_unification(
        '::foo.baz',
        '::bar {@extend .baz}',
        '::foo.baz')

    # XXX assert_extend_doesnt_match('::foo(2n+1)', '.baz', :failed_to_unify, 2) do
    assert_unification(
        '::foo.baz',
        '::foo(2n+1) {@extend .baz}',
        '::foo.baz')

    assert_unification(
        '::foo.baz',
        '::foo {@extend .baz}',
        '::foo')
    assert_unification(
        '::foo(2n+1).baz',
        '::foo(2n+1) {@extend .baz}',
        '::foo(2n+1)')
    assert_unification(
        ':foo.baz',
        ':bar {@extend .baz}',
        ':foo.baz, :foo:bar')
    assert_unification(
        '.baz:foo',
        ':after {@extend .baz}',
        '.baz:foo, :foo:after')
    assert_unification(
        '.baz:after',
        ':foo {@extend .baz}',
        '.baz:after, :foo:after')
    assert_unification(
        ':foo.baz',
        ':foo {@extend .baz}',
        ':foo')

def test_pseudoelement_remains_at_end_of_selector():
    assert_extends(
        '.foo::bar',
        '.baz {@extend .foo}',
        '.foo::bar, .baz::bar')
    assert_extends(
        'a.foo::bar',
        '.baz {@extend .foo}',
        'a.foo::bar, a.baz::bar')

def test_pseudoclass_remains_at_end_of_selector():
    assert_extends(
        '.foo:bar',
        '.baz {@extend .foo}',
        '.foo:bar, .baz:bar')
    assert_extends(
        'a.foo:bar',
        '.baz {@extend .foo}',
        'a.foo:bar, a.baz:bar')

def test_not_remains_at_end_of_selector():
    assert_extends(
        '.foo:not(.bar)',
        '.baz {@extend .foo}',
        '.foo:not(.bar), .baz:not(.bar)')

def test_pseudoelement_goes_lefter_than_pseudoclass():
    assert_extends(
        '.foo::bar',
        '.baz:bang {@extend .foo}',
        '.foo::bar, .baz:bang::bar')
    assert_extends(
        '.foo:bar',
        '.baz::bang {@extend .foo}',
        '.foo:bar, .baz:bar::bang')

def test_pseudoelement_goes_lefter_than_not():
    assert_extends(
        '.foo::bar',
        '.baz:not(.bang) {@extend .foo}',
        '.foo::bar, .baz:not(.bang)::bar')
    assert_extends(
        '.foo:not(.bang)',
        '.baz::bar {@extend .foo}',
        '.foo:not(.bang), .baz:not(.bang)::bar')

def test_negation_unification():
    assert_unification(
        ':not(.foo).baz',
        ':not(.bar) {@extend .baz}',
        ':not(.foo).baz, :not(.foo):not(.bar)')
    assert_unification(
        ':not(.foo).baz',
        ':not(.foo) {@extend .baz}',
        ':not(.foo)')
    assert_unification(
        ':not([a=b]).baz',
        ':not([a = b]) {@extend .baz}',
        ':not([a=b])')

def test_comma_extendee():
    assert_rendering('''\
.foo {a: b}
.bar {c: d}
.baz {@extend .foo, .bar}
''', '''\
.foo, .baz {
  a: b; }

.bar, .baz {
  c: d; }
''')

def test_redundant_selector_elimination():
    assert_rendering('''\
.foo.bar {a: b}
.x {@extend .foo, .bar}
.y {@extend .foo, .bar}
''', '''\
.foo.bar, .x, .y {
  a: b; }
''')

  ## Long Extendees

def test_long_extendee():
    assert_extends(
        '.foo.bar',
        '.baz {@extend .foo.bar}',
        '.foo.bar, .baz')

def test_long_extendee_requires_all_selectors():
    # XXX assert_extend_doesnt_match('.baz', '.foo.bar', :not_found, 2) do
    assert_extends(
        '.foo',
        '.baz {@extend .foo.bar}',
        '.foo')

def test_long_extendee_matches_supersets():
    assert_extends(
        '.foo.bar.bap',
        '.baz {@extend .foo.bar}',
        '.foo.bar.bap, .bap.baz')

def test_long_extendee_runs_unification():
    assert_extends(
        'ns|*.foo.bar',
        'a.baz {@extend .foo.bar}',
        'ns|*.foo.bar, ns|a.baz')

  ## Long Extenders

def test_long_extender():
    assert_extends(
        '.foo.bar',
        '.baz.bang {@extend .foo}',
        '.foo.bar, .bar.baz.bang')

def test_long_extender_runs_unification():
    assert_extends(
        'ns|*.foo.bar',
        'a.baz {@extend .foo}',
        'ns|*.foo.bar, ns|a.bar.baz')

def test_long_extender_aborts_unification():
    # XXX assert_extend_doesnt_match('h1.baz', '.foo', :failed_to_unify, 2) do
    assert_extends(
        'a.foo#bar',
        'h1.baz {@extend .foo}',
        'a.foo#bar')

    # XXX assert_extend_doesnt_match('.bang#baz', '.foo', :failed_to_unify, 2) do
    assert_extends(
        'a.foo#bar',
        '.bang#baz {@extend .foo}',
        'a.foo#bar')

  ## Nested Extenders

def test_nested_extender():
    assert_extends(
        '.foo',
        'foo bar {@extend .foo}',
        '.foo, foo bar')

def test_nested_extender_runs_unification():
    assert_extends(
        '.foo.bar',
        'foo bar {@extend .foo}',
        '.foo.bar, foo bar.bar')

def test_nested_extender_aborts_unification():
    # XXX assert_extend_doesnt_match('foo bar', '.foo', :failed_to_unify, 2) do
    assert_extends(
        'baz.foo',
        'foo bar {@extend .foo}',
        'baz.foo')

def test_nested_extender_alternates_parents():
    assert_extends('.baz .bip .foo', 'foo .grank bar {@extend .foo}',
      '.baz .bip .foo, .baz .bip foo .grank bar, foo .grank .baz .bip bar')

def test_nested_extender_unifies_identical_parents():
    assert_extends('.baz .bip .foo', '.baz .bip bar {@extend .foo}',
      '.baz .bip .foo, .baz .bip bar')

def test_nested_extender_unifies_common_substring():
    assert_extends('.baz .bip .bap .bink .foo', '.brat .bip .bap bar {@extend .foo}',
      '.baz .bip .bap .bink .foo, .baz .brat .bip .bap .bink bar, .brat .baz .bip .bap .bink bar')

def test_nested_extender_unifies_common_subseq():
    assert_extends('.a .x .b .y .foo', '.a .n .b .m bar {@extend .foo}',
      '.a .x .b .y .foo, .a .x .n .b .y .m bar, .a .n .x .b .y .m bar, .a .x .n .b .m .y bar, .a .n .x .b .m .y bar')

def test_nested_extender_chooses_first_subseq():
    assert_extends('.a .b .c .d .foo', '.c .d .a .b .bar {@extend .foo}',
      '.a .b .c .d .foo, .a .b .c .d .a .b .bar')

def test_nested_extender_counts_extended_subselectors():
    assert_extends('.a .bip.bop .foo', '.b .bip .bar {@extend .foo}',
      '.a .bip.bop .foo, .a .b .bip.bop .bar, .b .a .bip.bop .bar')

def test_nested_extender_counts_extended_superselectors():
    assert_extends('.a .bip .foo', '.b .bip.bop .bar {@extend .foo}',
      '.a .bip .foo, .a .b .bip.bop .bar, .b .a .bip.bop .bar')

def test_nested_extender_with_child_selector():
    assert_extends(
        '.baz .foo',
        'foo > bar {@extend .foo}',
        '.baz .foo, .baz foo > bar')

def test_nested_extender_finds_common_selectors_around_child_selector():
    assert_extends(
        'a > b c .c1',
        'a c .c2 {@extend .c1}',
        'a > b c .c1, a > b c .c2')
    assert_extends(
        'a > b c .c1',
        'b c .c2 {@extend .c1}',
        'a > b c .c1, a > b c .c2')

def test_nested_extender_doesnt_find_common_selectors_around_adjacent_sibling_selector():
    assert_extends(
        'a + b c .c1',
        'a c .c2 {@extend .c1}',
        'a + b c .c1, a + b a c .c2, a a + b c .c2')
    assert_extends(
        'a + b c .c1',
        'a b .c2 {@extend .c1}',
        'a + b c .c1, a a + b c .c2')
    assert_extends(
        'a + b c .c1',
        'b c .c2 {@extend .c1}',
        'a + b c .c1, a + b c .c2')

def test_nested_extender_doesnt_find_common_selectors_around_sibling_selector():
    assert_extends(
        'a ~ b c .c1',
        'a c .c2 {@extend .c1}',
        'a ~ b c .c1, a ~ b a c .c2, a a ~ b c .c2')
    assert_extends(
        'a ~ b c .c1',
        'a b .c2 {@extend .c1}',
        'a ~ b c .c1, a a ~ b c .c2')
    assert_extends(
        'a ~ b c .c1',
        'b c .c2 {@extend .c1}',
        'a ~ b c .c1, a ~ b c .c2')

def test_nested_extender_doesnt_find_common_selectors_around_reference_selector():
    assert_extends(
        'a /for/ b c .c1',
        'a c .c2 {@extend .c1}',
        'a /for/ b c .c1, a /for/ b a c .c2, a a /for/ b c .c2')
    assert_extends(
        'a /for/ b c .c1',
        'a b .c2 {@extend .c1}',
        'a /for/ b c .c1, a a /for/ b c .c2')
    assert_extends(
        'a /for/ b c .c1',
        'b c .c2 {@extend .c1}',
        'a /for/ b c .c1, a /for/ b c .c2')

def test_nested_extender_with_early_child_selectors_doesnt_subseq_them():
    assert_extends('.bip > .bap .foo', '.grip > .bap .bar {@extend .foo}',
      '.bip > .bap .foo, .bip > .bap .grip > .bap .bar, .grip > .bap .bip > .bap .bar')
    assert_extends('.bap > .bip .foo', '.bap > .grip .bar {@extend .foo}',
      '.bap > .bip .foo, .bap > .bip .bap > .grip .bar, .bap > .grip .bap > .bip .bar')

def test_nested_extender_with_child_selector_unifies():
    assert_extends(
        '.baz.foo',
        'foo > bar {@extend .foo}',
        '.baz.foo, foo > bar.baz')

    assert_rendering('''\
.baz > {
  .foo {a: b}
  .bar {@extend .foo}
}
''', '''\
.baz > .foo, .baz > .bar {
  a: b; }
''')

    assert_rendering('''\
.foo {
  .bar {a: b}
  > .baz {@extend .bar}
}
''', '''\
.foo .bar, .foo > .baz {
  a: b; }
''')

def test_nested_extender_with_early_child_selectors_doesnt_subseq_them():
    assert_rendering('''\
.foo {
  .bar {a: b}
  .bip > .baz {@extend .bar}
}
''', '''\
.foo .bar, .foo .bip > .baz {
  a: b; }
''')

    assert_rendering('''\
.foo {
  .bip .bar {a: b}
  > .baz {@extend .bar}
}
''', '''\
.foo .bip .bar, .foo .bip .foo > .baz {
  a: b; }
''')

    assert_extends(
        '.foo > .bar',
        '.bip + .baz {@extend .bar}',
        '.foo > .bar, .foo > .bip + .baz')
    assert_extends(
        '.foo + .bar',
        '.bip > .baz {@extend .bar}',
        '.foo + .bar, .bip > .foo + .baz')
    assert_extends(
        '.foo > .bar',
        '.bip > .baz {@extend .bar}',
        '.foo > .bar, .bip.foo > .baz')

def test_nested_extender_with_trailing_child_selector():
    with pytest.raises(SyntaxError):
        # "bar > can't extend: invalid selector"
        render("bar > {@extend .baz}")

def test_nested_extender_with_sibling_selector():
    assert_extends(
        '.baz .foo',
        'foo + bar {@extend .foo}',
        '.baz .foo, .baz foo + bar')

def test_nested_extender_with_hacky_selector():
    assert_extends('.baz .foo', 'foo + > > + bar {@extend .foo}',
      '.baz .foo, .baz foo + > > + bar, foo .baz + > > + bar')
    assert_extends(
        '.baz .foo',
        '> > bar {@extend .foo}',
        '.baz .foo, > > .baz bar')

def test_nested_extender_merges_with_same_selector():
    assert_rendering('''\
.foo {
  .bar {a: b}
  .baz {@extend .bar} }
''', '''\
.foo .bar, .foo .baz {
  a: b; }
''')

def test_nested_extender_with_child_selector_merges_with_same_selector():
    assert_extends('.foo > .bar .baz', '.foo > .bar .bang {@extend .baz}',
      '.foo > .bar .baz, .foo > .bar .bang')

  # Combinator Unification

def test_combinator_unification_for_hacky_combinators():
    assert_extends(
        '.a > + x',
        '.b y {@extend x}',
        '.a > + x, .a .b > + y, .b .a > + y')
    assert_extends(
        '.a x',
        '.b > + y {@extend x}',
        '.a x, .a .b > + y, .b .a > + y')
    assert_extends(
        '.a > + x',
        '.b > + y {@extend x}',
        '.a > + x, .a .b > + y, .b .a > + y')
    assert_extends(
        '.a ~ > + x',
        '.b > + y {@extend x}',
        '.a ~ > + x, .a .b ~ > + y, .b .a ~ > + y')
    assert_extends(
        '.a + > x',
        '.b > + y {@extend x}',
        '.a + > x')
    assert_extends(
        '.a + > x',
        '.b > + y {@extend x}',
        '.a + > x')
    assert_extends(
        '.a ~ > + .b > x',
        '.c > + .d > y {@extend x}',
        '.a ~ > + .b > x, .a .c ~ > + .d.b > y, .c .a ~ > + .d.b > y')

def test_combinator_unification_double_tilde():
    assert_extends(
        '.a.b ~ x',
        '.a ~ y {@extend x}',
        '.a.b ~ x, .a.b ~ y')
    assert_extends(
        '.a ~ x',
        '.a.b ~ y {@extend x}',
        '.a ~ x, .a.b ~ y')
    assert_extends(
        '.a ~ x',
        '.b ~ y {@extend x}',
        '.a ~ x, .a ~ .b ~ y, .b ~ .a ~ y, .b.a ~ y')
    assert_extends(
        'a.a ~ x',
        'b.b ~ y {@extend x}',
        'a.a ~ x, a.a ~ b.b ~ y, b.b ~ a.a ~ y')

def test_combinator_unification_tilde_plus():
    assert_extends(
        '.a.b + x',
        '.a ~ y {@extend x}',
        '.a.b + x, .a.b + y')
    assert_extends(
        '.a + x',
        '.a.b ~ y {@extend x}',
        '.a + x, .a.b ~ .a + y, .a.b + y')
    assert_extends(
        '.a + x',
        '.b ~ y {@extend x}',
        '.a + x, .b ~ .a + y, .b.a + y')
    assert_extends(
        'a.a + x',
        'b.b ~ y {@extend x}',
        'a.a + x, b.b ~ a.a + y')
    assert_extends(
        '.a.b ~ x',
        '.a + y {@extend x}',
        '.a.b ~ x, .a.b ~ .a + y, .a.b + y')
    assert_extends(
        '.a ~ x',
        '.a.b + y {@extend x}',
        '.a ~ x, .a.b + y')
    assert_extends(
        '.a ~ x',
        '.b + y {@extend x}',
        '.a ~ x, .a ~ .b + y, .a.b + y')
    assert_extends(
        'a.a ~ x',
        'b.b + y {@extend x}',
        'a.a ~ x, a.a ~ b.b + y')

def test_combinator_unification_angle_sibling():
    assert_extends(
        '.a > x',
        '.b ~ y {@extend x}',
        '.a > x, .a > .b ~ y')
    assert_extends(
        '.a > x',
        '.b + y {@extend x}',
        '.a > x, .a > .b + y')
    assert_extends(
        '.a ~ x',
        '.b > y {@extend x}',
        '.a ~ x, .b > .a ~ y')
    assert_extends(
        '.a + x',
        '.b > y {@extend x}',
        '.a + x, .b > .a + y')

def test_combinator_unification_double_angle():
    assert_extends(
        '.a.b > x',
        '.b > y {@extend x}',
        '.a.b > x, .b.a > y')
    assert_extends(
        '.a > x',
        '.a.b > y {@extend x}',
        '.a > x, .a.b > y')
    assert_extends(
        '.a > x',
        '.b > y {@extend x}',
        '.a > x, .b.a > y')
    assert_extends(
        'a.a > x',
        'b.b > y {@extend x}',
        'a.a > x')

def test_combinator_unification_double_plus():
    assert_extends(
        '.a.b + x',
        '.b + y {@extend x}',
        '.a.b + x, .b.a + y')
    assert_extends(
        '.a + x',
        '.a.b + y {@extend x}',
        '.a + x, .a.b + y')
    assert_extends(
        '.a + x',
        '.b + y {@extend x}',
        '.a + x, .b.a + y')
    assert_extends(
        'a.a + x',
        'b.b + y {@extend x}',
        'a.a + x')

def test_combinator_unification_angle_space():
    assert_extends(
        '.a.b > x',
        '.a y {@extend x}',
        '.a.b > x, .a.b > y')
    assert_extends(
        '.a > x',
        '.a.b y {@extend x}',
        '.a > x, .a.b .a > y')
    assert_extends(
        '.a > x',
        '.b y {@extend x}',
        '.a > x, .b .a > y')
    assert_extends(
        '.a.b x',
        '.a > y {@extend x}',
        '.a.b x, .a.b .a > y')
    assert_extends(
        '.a x',
        '.a.b > y {@extend x}',
        '.a x, .a.b > y')
    assert_extends(
        '.a x',
        '.b > y {@extend x}',
        '.a x, .a .b > y')

def test_combinator_unification_plus_space():
    assert_extends(
        '.a.b + x',
        '.a y {@extend x}',
        '.a.b + x, .a .a.b + y')
    assert_extends(
        '.a + x',
        '.a.b y {@extend x}',
        '.a + x, .a.b .a + y')
    assert_extends(
        '.a + x',
        '.b y {@extend x}',
        '.a + x, .b .a + y')
    assert_extends(
        '.a.b x',
        '.a + y {@extend x}',
        '.a.b x, .a.b .a + y')
    assert_extends(
        '.a x',
        '.a.b + y {@extend x}',
        '.a x, .a .a.b + y')
    assert_extends(
        '.a x',
        '.b + y {@extend x}',
        '.a x, .a .b + y')

def test_combinator_unification_nested():
    assert_extends(
        '.a > .b + x',
        '.c > .d + y {@extend x}',
        '.a > .b + x, .c.a > .d.b + y')
    assert_extends(
        '.a > .b + x',
        '.c > y {@extend x}',
        '.a > .b + x, .c.a > .b + y')

def test_combinator_unification_with_newlines():
    assert_rendering('''\
.a >
.b
+ x {a: b}
.c
> .d +
y {@extend x}
''', '''\
.a >
.b
+ x, .c.a > .d.b + y {
  a: b; }
''')

  # Loops

def test_extend_self_loop():
    assert_rendering('''\
.foo {a: b; @extend .foo}
''', '''\
.foo {
  a: b; }
''')

def test_basic_extend_loop():
    assert_rendering('''\
.foo {a: b; @extend .bar}
.bar {c: d; @extend .foo}
''', '''\
.bar, .foo {
  a: b; }

.foo, .bar {
  c: d; }
''')

def test_three_level_extend_loop():
    assert_rendering('''\
.foo {a: b; @extend .bar}
.bar {c: d; @extend .baz}
.baz {e: f; @extend .foo}
''', '''\
.baz, .bar, .foo {
  a: b; }

.foo, .baz, .bar {
  c: d; }

.bar, .foo, .baz {
  e: f; }
''')

def test_nested_extend_loop():
    assert_rendering('''\
.bar {
  a: b;
  .foo {c: d; @extend .bar}
}
''', '''\
.bar, .bar .foo {
  a: b; }
  .bar .foo {
    c: d; }
''')

def test_multiple_extender_merges_with_superset_selector():
    assert_rendering('''\
.foo {@extend .bar; @extend .baz}
a.bar.baz {a: b}
''', '''\
a.bar.baz, a.foo {
  a: b; }
''')

def test_control_flow_if():
    assert_rendering('''\
.true  { color: green; }
.false { color: red;   }
.also-true {
  @if true { @extend .true;  }
  @else    { @extend .false; }
}
.also-false {
  @if false { @extend .true;  }
  @else     { @extend .false; }
}
''', '''\
.true, .also-true {
  color: green; }

.false, .also-false {
  color: red; }
''')

def test_control_flow_for():
    assert_rendering('''\
.base-0  { color: green; }
.base-1  { display: block; }
.base-2  { border: 1px solid blue; }
.added {
  @for $i from 0 to 3 {
    @extend .base-\#{$i};
  }
}
''', '''\
.base-0, .added {
  color: green; }

.base-1, .added {
  display: block; }

.base-2, .added {
  border: 1px solid blue; }
''')

def test_control_flow_while():
    assert_rendering('''\
.base-0  { color: green; }
.base-1  { display: block; }
.base-2  { border: 1px solid blue; }
.added {
  $i : 0;
  @while $i < 3 {
    @extend .base-\#{$i};
    $i : $i + 1;
  }
}
''', '''\
.base-0, .added {
  color: green; }

.base-1, .added {
  display: block; }

.base-2, .added {
  border: 1px solid blue; }
''')

def test_basic_placeholder_selector():
    assert_extends(
        '%foo',
        '.bar {@extend %foo}',
        '.bar')

def test_unused_placeholder_selector():
    assert_rendering('''\
%foo {color: blue}
%bar {color: red}
.baz {@extend %foo}
''', '''\
.baz {
  color: blue; }
''')

def test_placeholder_descendant_selector():
    assert_extends(
        '#context %foo a',
        '.bar {@extend %foo}',
        '#context .bar a')

def test_semi_placeholder_selector():
    assert_rendering('''\
#context %foo, .bar .baz {color: blue}
''', '''\
.bar .baz {
  color: blue; }
''')

def test_placeholder_selector_with_multiple_extenders():
    assert_rendering('''\
%foo {color: blue}
.bar {@extend %foo}
.baz {@extend %foo}
''', '''\
.bar, .baz {
  color: blue; }
''')

def test_placeholder_selector_as_modifier():
    # XXX assert_extend_doesnt_match('div', '%foo', :failed_to_unify, 3) do
    assert_rendering('''\
a%foo.baz {color: blue}
.bar {@extend %foo}
div {@extend %foo}
''', '''\
a.baz.bar {
  color: blue; }
''')

def test_placeholder_interpolation():
    assert_rendering('''\
$foo: foo;

%\#{$foo} {color: blue}
.bar {@extend %foo}
''', '''\
.bar {
  color: blue; }
''')

def test_media_in_placeholder_selector():
    assert_rendering('''\
%foo {bar {@media screen {a: b}}}
.baz {c: d}
''', '''\
.baz {
  c: d; }
''')

"""
def test_extend_out_of_media():
    assert_warning(<<WARN) {assert_equal(<<CSS, render(<<SCSS))}
DEPRECATION WARNING on line 3 of test_extend_out_of_media_inline.scss:
  @extending an outer selector from within @media is deprecated.
  You may only @extend selectors within the same directive.
  This will be an error in Sass 3.3.
  It can only work once @extend is supported natively in the browser.
WARN
.foo {
  a: b; }
CSS
.foo {a: b}
@media screen {
  .bar {@extend .foo}
}
SCSS

def test_extend_out_of_unknown_directive():
    assert_warning(<<WARN) {assert_equal(<<CSS, render(<<SCSS))}
DEPRECATION WARNING on line 3 of test_extend_out_of_unknown_directive_inline.scss:
  @extending an outer selector from within @flooblehoof is deprecated.
  You may only @extend selectors within the same directive.
  This will be an error in Sass 3.3.
  It can only work once @extend is supported natively in the browser.
WARN
.foo {
  a: b; }

@flooblehoof {}
CSS
.foo {a: b}
@flooblehoof {
  .bar {@extend .foo}
}
SCSS

def test_extend_out_of_nested_directives():
    assert_warning(<<WARN) {assert_equal(<<CSS, render(<<SCSS))}
DEPRECATION WARNING on line 4 of test_extend_out_of_nested_directives_inline.scss:
  @extending an outer selector from within @flooblehoof is deprecated.
  You may only @extend selectors within the same directive.
  This will be an error in Sass 3.3.
  It can only work once @extend is supported natively in the browser.
WARN
@media screen {
  .foo {
    a: b; }

  @flooblehoof {} }
CSS
@media screen {
  .foo {a: b}
  @flooblehoof {
    .bar {@extend .foo}
  }
}
SCSS
"""

def test_extend_within_media():
    assert_rendering('''\
@media screen {
  .foo {a: b}
  .bar {@extend .foo}
}
''', '''\
@media screen {
  .foo, .bar {
    a: b; } }
''')

def test_extend_within_unknown_directive():
    assert_rendering('''\
@flooblehoof {
  .foo {a: b}
  .bar {@extend .foo}
}
''', '''\
@flooblehoof {
  .foo, .bar {
    a: b; } }
''')

def test_extend_within_nested_directives():
    assert_rendering('''\
@media screen {
  @flooblehoof {
    .foo {a: b}
    .bar {@extend .foo}
  }
}
''', '''\
@media screen {
  @flooblehoof {
    .foo, .bar {
      a: b; } } }
''')

def test_extend_within_disparate_media():
    assert_rendering('''\
@media screen {.foo {a: b}}
@media screen {.bar {@extend .foo}}
''', '''\
@media screen {
  .foo, .bar {
    a: b; } }
''')

def test_extend_within_disparate_unknown_directive():
    assert_rendering('''\
@flooblehoof {.foo {a: b}}
@flooblehoof {.bar {@extend .foo}}
''', '''\
@flooblehoof {
  .foo, .bar {
    a: b; } }

@flooblehoof {}
''')

def test_extend_within_disparate_nested_directives():
    assert_rendering('''\
@media screen {@flooblehoof {.foo {a: b}}}
@media screen {@flooblehoof {.bar {@extend .foo}}}
''', '''\
@media screen {
  @flooblehoof {
    .foo, .bar {
      a: b; } } }
@media screen {
  @flooblehoof {} }
''')

"""
def test_extend_within_and_without_media():
    assert_warning(<<WARN) {assert_equal(<<CSS, render(<<SCSS))}
DEPRECATION WARNING on line 4 of test_extend_within_and_without_media_inline.scss:
  @extending an outer selector from within @media is deprecated.
  You may only @extend selectors within the same directive.
  This will be an error in Sass 3.3.
  It can only work once @extend is supported natively in the browser.
WARN
.foo {
  a: b; }

@media screen {
  .foo, .bar {
    c: d; } }
CSS
.foo {a: b}
@media screen {
  .foo {c: d}
  .bar {@extend .foo}
}
SCSS

def test_extend_within_and_without_unknown_directive():
    assert_warning(<<WARN) {assert_equal(<<CSS, render(<<SCSS))}
DEPRECATION WARNING on line 4 of test_extend_within_and_without_unknown_directive_inline.scss:
  @extending an outer selector from within @flooblehoof is deprecated.
  You may only @extend selectors within the same directive.
  This will be an error in Sass 3.3.
  It can only work once @extend is supported natively in the browser.
WARN
.foo {
  a: b; }

@flooblehoof {
  .foo, .bar {
    c: d; } }
CSS
.foo {a: b}
@flooblehoof {
  .foo {c: d}
  .bar {@extend .foo}
}
SCSS

def test_extend_within_and_without_nested_directives():
    assert_warning(<<WARN) {assert_equal(<<CSS, render(<<SCSS))}
DEPRECATION WARNING on line 5 of test_extend_within_and_without_nested_directives_inline.scss:
  @extending an outer selector from within @flooblehoof is deprecated.
  You may only @extend selectors within the same directive.
  This will be an error in Sass 3.3.
  It can only work once @extend is supported natively in the browser.
WARN
@media screen {
  .foo {
    a: b; }

  @flooblehoof {
    .foo, .bar {
      c: d; } } }
CSS
@media screen {
  .foo {a: b}
  @flooblehoof {
    .foo {c: d}
    .bar {@extend .foo}
  }
}
SCSS
"""

def test_extend_with_subject_transfers_subject_to_extender():
    assert_rendering('''\
foo bar! baz {a: b}
.bip .bap {@extend bar}
''', '''\
foo bar! baz, foo .bip .bap! baz, .bip foo .bap! baz {
  a: b; }
''')

    assert_rendering('''\
foo.x bar.y! baz.z {a: b}
.bip .bap {@extend .y}
''', '''\
foo.x bar.y! baz.z, foo.x .bip bar.bap! baz.z, .bip foo.x bar.bap! baz.z {
  a: b; }
''')

def test_extend_with_subject_retains_subject_on_target():
    assert_rendering('''\
.foo! .bar {a: b}
.bip .bap {@extend .bar}
''', '''\
.foo! .bar, .foo! .bip .bap, .bip .foo! .bap {
  a: b; }
''')

def test_extend_with_subject_transfers_subject_to_target():
    assert_rendering('''\
a.foo .bar {a: b}
.bip .bap! {@extend .foo}
''', '''\
a.foo .bar, .bip a.bap! .bar {
  a: b; }
''')

def test_extend_with_subject_retains_subject_on_extender():
    assert_rendering('''\
.foo .bar {a: b}
.bip! .bap {@extend .bar}
''', '''\
.foo .bar, .foo .bip! .bap, .bip! .foo .bap {
  a: b; }
''')

def test_extend_with_subject_fails_with_conflicting_subject():
    assert_rendering('''\
x! .bar {a: b}
y! .bap {@extend .bar}
''', '''\
x! .bar {
  a: b; }
''')

"""
def test_extend_warns_when_extendee_doesnt_exist():
    assert_warning(<<WARN) {assert_equal("", render(<<SCSS))}
WARNING on line 1 of test_extend_warns_when_extendee_doesnt_exist_inline.scss: ".foo" failed to @extend ".bar".
  The selector ".bar" was not found.
  This will be an error in future releases of Sass.
  Use "@extend .bar !optional" if the extend should be able to fail.
WARN
.foo {@extend .bar}
SCSS

def test_extend_warns_when_extension_fails():
    assert_warning(<<WARN) {assert_equal(<<CSS, render(<<SCSS))}
WARNING on line 2 of test_extend_warns_when_extension_fails_inline.scss: "b.foo" failed to @extend ".bar".
  No selectors matching ".bar" could be unified with "b.foo".
  This will be an error in future releases of Sass.
  Use "@extend .bar !optional" if the extend should be able to fail.
WARN
a.bar {
  a: b; }
CSS
a.bar {a: b}
b.foo {@extend .bar}
SCSS

def test_extend_does_not_warn_when_one_extension_fails_but_others_dont():
    assert_no_warning {assert_equal(<<CSS, render(<<SCSS))}
a.bar {
  a: b; }

.bar, b.foo {
  c: d; }
CSS
a.bar {a: b}
.bar {c: d}
b.foo {@extend .bar}
SCSS

def test_extend_does_not_warn_when_one_extension_fails_but_others_dont():
    assert_no_warning {assert_equal(<<CSS, render(<<SCSS))}
a.bar {
  a: b; }

.bar, b.foo {
  c: d; }
CSS
a.bar {a: b}
.bar {c: d}
b.foo {@extend .bar}
SCSS

def test_optional_extend_does_not_warn_when_extendee_doesnt_exist():
    assert_no_warning {assert_equal("", render(<<SCSS))}
.foo {@extend .bar !optional}
SCSS

def test_optional_extend_does_not_warn_when_extension_fails():
    assert_no_warning {assert_equal(<<CSS, render(<<SCSS))}
a.bar {
  a: b; }
CSS
a.bar {a: b}
b.foo {@extend .bar !optional}
SCSS
"""


### Regression Tests

def test_nested_extend_specificity():
    assert_rendering('''\
%foo {a: b}

a {
  :b {@extend %foo}
  :b:c {@extend %foo}
}
''', '''\
a :b, a :b:c {
  a: b; }
''')

def test_nested_double_extend_optimization():
    assert_rendering('''\
%foo %bar {
  a: b;
}

.parent1 {
  @extend %foo;

  .child {
    @extend %bar;
  }
}

.parent2 {
  @extend %foo;
}
''', '''\
.parent1 .child {
  a: b; }
''')

def test_extend_in_double_nested_media_query():
    assert_rendering('''\
@media all {
  @media (orientation: landscape) {
    %foo {color: blue}
    .bar {@extend %foo}
  }
}
''', '''\
@media all and (orientation: landscape) {
  .bar {
    color: blue; } }
''')

"""
def test_partially_failed_extend():
    assert_no_warning {assert_equal(<<CSS, render(<<SCSS))}
.rc, test {
  color: white; }

.prices span.pill span.rc {
  color: red; }
CSS
test { @extend .rc; }
.rc {color: white;}
.prices span.pill span.rc {color: red;}
SCSS
"""

def test_newline_near_combinator():
    assert_rendering('''\
.a +
.b x {a: b}
.c y {@extend x}
''', '''\
.a +
.b x, .a +
.b .c y, .c .a +
.b y {
  a: b; }
''')

def test_duplicated_selector_with_newlines():
    assert_rendering('''\
.example-1-1,
.example-1-2,
.example-1-3 {
  a: b;
}

.my-page-1 .my-module-1-1 {@extend .example-1-2}
''', '''\
.example-1-1,
.example-1-2,
.my-page-1 .my-module-1-1,
.example-1-3 {
  a: b; }
''')

def test_nested_selector_with_child_selector_hack_extendee():
    assert_extends(
        '> .foo',
        'foo bar {@extend .foo}',
        '> .foo, > foo bar')

def test_nested_selector_with_child_selector_hack_extender():
    assert_extends(
        '.foo .bar',
        '> foo bar {@extend .bar}',
        '.foo .bar, > .foo foo bar, > foo .foo bar')

def test_nested_selector_with_child_selector_hack_extender_and_extendee():
    assert_extends(
        '> .foo',
        '> foo bar {@extend .foo}',
        '> .foo, > foo bar')

def test_nested_selector_with_child_selector_hack_extender_and_sibling_selector_extendee():
    assert_extends(
        '~ .foo',
        '> foo bar {@extend .foo}',
        '~ .foo')

def test_nested_selector_with_child_selector_hack_extender_and_extendee_and_newline():
    assert_rendering('''\
> .foo {a: b}
flip,
> foo bar {@extend .foo}
''', '''\
> .foo, > flip,
> foo bar {
  a: b; }
''')

def test_extended_parent_and_child_redundancy_elimination():
    assert_rendering('''\
a {
  b {a: b}
  c {@extend b}
}
d {@extend a}
''', '''\
a b, d b, a c, d c {
  a: b; }
''')

def test_extend_redundancy_elimination_when_it_would_reduce_specificity():
    assert_extends(
        'a',
        'a.foo {@extend a}',
        'a, a.foo')

def test_extend_redundancy_elimination_when_it_would_preserve_specificity():
    assert_extends(
        '.bar a',
        'a.foo {@extend a}',
        '.bar a')

def test_extend_redundancy_elimination_never_eliminates_base_selector():
    assert_extends(
        'a.foo',
        '.foo {@extend a}',
        'a.foo, .foo')

def test_extend_cross_branch_redundancy_elimination():
    assert_rendering('''\
%x c %y {a: b}
a, b {@extend %x}
a d {@extend %y}
''', '''\
a c d, b c a d {
  a: b; }
''')

    assert_rendering('''\
e %z {a: b}
%x c %y {@extend %z}
a, b {@extend %x}
a d {@extend %y}
''', '''\
e a c d, a c e d, e b c a d, b c a e d {
  a: b; }
''')


"""
def assert_extend_doesnt_match(extender, target, reason, line, syntax = :scss):
    warn = "\"#{extender}\" failed to @extend \"#{target}\"."
    reason =
      if reason == :not_found
        "The selector \"#{target}\" was not found."
      else
        "No selectors matching \"#{target}\" could be unified with \"#{extender}\"."

    assert_warning(<<WARNING) {yield}
WARNING on line #{line} of #{filename_for_test syntax}: #{warn}
  #{reason}
  This will be an error in future releases of Sass.
  Use "@extend #{target} !optional" if the extend should be able to fail.
WARNING
"""

def assert_unification(selector, extension, unified):
    # Do some trickery so the first law of extend doesn't get in our way.
    assert_extends(
      "%-a {0}".format(selector),
      extension + " -a {@extend %-a}",
      ', '.join('-a ' + s for s in unified.split(', ')))

def assert_extends(selector, extension, result):
    assert_rendering(
        "{0} {{a: b}}\n{1}\n".format(selector, extension),
        "{0} {{\n  a: b; }}\n".format(result))
