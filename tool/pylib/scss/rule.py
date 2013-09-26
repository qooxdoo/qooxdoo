from __future__ import absolute_import
from __future__ import print_function

import logging
from itertools import chain
from scss.six import six

from scss.types import Value


log = logging.getLogger(__name__)


def normalize_var(name):
    if isinstance(name, six.string_types):
        return name.replace('_', '-')
    else:
        log.warn("Variable name doesn't look like a string: %r", name)
        return name


def extend_unique(seq, more):
    """Return a new sequence containing the items in `seq` plus any items in
    `more` that aren't already in `seq`, preserving the order of both.
    """
    seen = set(seq)
    new = []
    for item in more:
        if item not in seen:
            seen.add(item)
            new.append(item)

    return seq + type(seq)(new)


class VariableScope(object):
    """Implements Sass variable scoping.

    Similar to `ChainMap`, except that assigning a new value will replace an
    existing value, not mask it.
    """
    def __init__(self, maps=()):
        self.maps = [dict()] + list(maps)

    def __repr__(self):
        return "<VariableScope(%s)>" % (', '.join(repr(map) for map in self.maps),)

    def __getitem__(self, key):
        for map in self.maps:
            if key in map:
                return map[key]

        raise KeyError(key)

    def __setitem__(self, key, value):
        self.set(key, value)

    def keys(self):
        # For mapping interface
        return list(chain(*self.maps))

    def set(self, key, value, force_local=False):
        if force_local:
            self.maps[0][key] = value
            return

        for map in self.maps:
            if key in map:
                map[key] = value
                return

        self.maps[0][key] = value

    def new_child(self):
        return VariableScope(self.maps)


class Namespace(object):
    """..."""

    def __init__(self, variables=None, functions=None, mixins=None):
        if variables is None:
            self._variables = VariableScope()
        else:
            # TODO parse into sass values once that's a thing, or require them
            # all to be
            self._variables = VariableScope([variables])

        if functions is None:
            self._functions = VariableScope()
        else:
            self._functions = VariableScope([functions._functions])

        self._mixins = VariableScope()

    @classmethod
    def derive_from(cls, *others):
        self = cls()
        if len(others) == 1:
            self._variables = others[0]._variables.new_child()
            self._functions = others[0]._functions.new_child()
            self._mixins = others[0]._mixins.new_child()
        else:
            # Note that this will create a 2-dimensional scope where each of
            # these scopes is checked first in order.  TODO is this right?
            self._variables = VariableScope(other._variables for other in others)
            self._functions = VariableScope(other._functions for other in others)
            self._mixins = VariableScope(other._mixins for other in others)
        return self

    def derive(self):
        """Return a new child namespace.  All existing variables are still
        readable and writeable, but any new variables will only exist within a
        new scope.
        """
        return type(self).derive_from(self)

    def variable(self, name, throw=False):
        name = normalize_var(name)
        return self._variables[name]

    def set_variable(self, name, value, local_only=False):
        name = normalize_var(name)
        if not isinstance(value, Value):
            raise TypeError("Expected a Sass type, while setting %s got %r" % (name, value,))
        self._variables.set(name, value, force_local=local_only)

    def _get_callable(self, chainmap, name, arity):
        name = normalize_var(name)
        if arity is not None:
            # With explicit arity, try the particular arity before falling back
            # to the general case (None)
            try:
                return chainmap[name, arity]
            except KeyError:
                pass

        return chainmap[name, None]

    def _set_callable(self, chainmap, name, arity, cb):
        name = normalize_var(name)
        chainmap[name, arity] = cb

    def mixin(self, name, arity):
        return self._get_callable(self._mixins, name, arity)

    def set_mixin(self, name, arity, cb):
        self._set_callable(self._mixins, name, arity, cb)

    def function(self, name, arity):
        return self._get_callable(self._functions, name, arity)

    def set_function(self, name, arity, cb):
        self._set_callable(self._functions, name, arity, cb)


class SassRule(object):
    """At its heart, a CSS rule: combination of a selector and zero or more
    properties.  But this is Sass, so it also tracks some Sass-flavored
    metadata, like `@extend` rules and `@media` nesting.
    """

    def __init__(self, source_file, unparsed_contents=None,
            options=None, properties=None,
            namespace=None,
            lineno=0, extends_selectors=frozenset(),
            ancestry=None):

        self.source_file = source_file
        self.lineno = lineno

        self.unparsed_contents = unparsed_contents
        self.options = options
        self.extends_selectors = extends_selectors

        if namespace is None:
            assert False
            self.namespace = Namespace()
        else:
            self.namespace = namespace

        if properties is None:
            self.properties = []
        else:
            self.properties = properties

        self.retval = None

        if ancestry is None:
            self.ancestry = RuleAncestry()
        else:
            self.ancestry = ancestry

    def __repr__(self):
        return "<SassRule %s, %d props>" % (
            self.ancestry,
            len(self.properties),
        )

    @property
    def selectors(self):
        # TEMPORARY
        if self.ancestry.headers and self.ancestry.headers[-1].is_selector:
            return self.ancestry.headers[-1].selectors
        else:
            return ()

    @property
    def file_and_line(self):
        """Return the filename and line number where this rule originally
        appears, in the form "foo.scss:3".  Used for error messages.
        """
        return "%s:%d" % (self.source_file.filename, self.lineno)

    @property
    def is_empty(self):
        """Return whether this rule is considered "empty" -- i.e., has no
        contents that should end up in the final CSS.
        """
        if self.properties:
            # Rules containing CSS properties are never empty
            return False

        if self.ancestry:
            header = self.ancestry[-1]
            if header.is_atrule and header.directive != '@media':
                # At-rules should always be preserved, UNLESS they are @media
                # blocks, which are known to be noise if they don't have any
                # contents of their own
                return False

        return True

    def copy(self):
        return type(self)(
            source_file=self.source_file,
            lineno=self.lineno,
            unparsed_contents=self.unparsed_contents,

            options=self.options,
            #properties=list(self.properties),
            properties=self.properties,
            extends_selectors=self.extends_selectors,
            #ancestry=list(self.ancestry),
            ancestry=self.ancestry,

            namespace=self.namespace.derive(),
        )


class RuleAncestry(object):
    def __init__(self, headers=()):
        self.headers = tuple(headers)

    def __len__(self):
        return len(self.headers)

    def with_nested_selectors(self, c_selectors):
        if self.headers and self.headers[-1].is_selector:
            # Need to merge with parent selectors
            p_selectors = self.headers[-1].selectors

            new_selectors = []
            for p_selector in p_selectors:
                for c_selector in c_selectors:
                    new_selectors.append(c_selector.with_parent(p_selector))

            # Replace the last header with the new merged selectors
            new_headers = self.headers[:-1] + (BlockSelectorHeader(new_selectors),)
            return RuleAncestry(new_headers)

        else:
            # Whoops, no parent selectors.  Just need to double-check that
            # there are no uses of `&`.
            for c_selector in c_selectors:
                if c_selector.has_parent_reference:
                    raise ValueError("Can't use parent selector '&' in top-level rules")

            # Add the children as a new header
            new_headers = self.headers + (BlockSelectorHeader(c_selectors),)
            return RuleAncestry(new_headers)

    def with_more_selectors(self, selectors):
        """Return a new ancestry that also matches the given selectors.  No
        nesting is done.
        """
        if self.headers and self.headers[-1].is_selector:
            new_selectors = extend_unique(
                self.headers[-1].selectors,
                selectors)
            new_headers = self.headers[:-1] + (
                BlockSelectorHeader(new_selectors),)
            return RuleAncestry(new_headers)
        else:
            new_headers = self.headers + (BlockSelectorHeader(selectors),)
            return RuleAncestry(new_headers)


class BlockHeader(object):
    """..."""
    # TODO doc me depending on how UnparsedBlock is handled...

    is_atrule = False
    is_scope = False
    is_selector = False

    @classmethod
    def parse(cls, prop, has_contents=False):
        # Simple pre-processing
        if prop.startswith('+') and not has_contents:
            # Expand '+' at the beginning of a rule as @include.  But not if
            # there's a block, because that's probably a CSS selector.
            # DEVIATION: this is some semi hybrid of Sass and xCSS syntax
            prop = '@include ' + prop[1:]
            try:
                if '(' not in prop or prop.index(':') < prop.index('('):
                    prop = prop.replace(':', '(', 1)
                    if '(' in prop:
                        prop += ')'
            except ValueError:
                pass
        elif prop.startswith('='):
            # Expand '=' at the beginning of a rule as @mixin
            prop = '@mixin ' + prop[1:]
        elif prop.startswith('@prototype '):
            # Remove '@prototype '
            # TODO what is @prototype??
            prop = prop[11:]

        # Minor parsing
        if prop.startswith('@'):
            if prop.lower().startswith('@else if '):
                directive = '@else if'
                argument = prop[9:]
            else:
                directive, _, argument = prop.partition(' ')
                directive = directive.lower()

            return BlockAtRuleHeader(directive, argument)
        else:
            if prop.endswith(':') or ': ' in prop:
                # Syntax is "<scope>: [prop]" -- if the optional prop exists,
                # it becomes the first rule with no suffix
                scope, unscoped_value = prop.split(':', 1)
                scope = scope.rstrip()
                unscoped_value = unscoped_value.lstrip()
                return BlockScopeHeader(scope, unscoped_value)
            else:
                return BlockSelectorHeader(prop)


class BlockAtRuleHeader(BlockHeader):
    is_atrule = True

    def __init__(self, directive, argument):
        self.directive = directive
        self.argument = argument

    def __repr__(self):
        return "<%s %r %r>" % (self.__class__.__name__, self.directive, self.argument)

    def render(self):
        if self.argument:
            return "%s %s" % (self.directive, self.argument)
        else:
            return self.directive


class BlockSelectorHeader(BlockHeader):
    is_selector = True

    def __init__(self, selectors):
        self.selectors = tuple(selectors)

    def __repr__(self):
        return "<%s %r>" % (self.__class__.__name__, self.selectors)

    def render(self, sep=', ', super_selector=''):
        return sep.join((
            super_selector + s.render()
            for s in self.selectors
            if not s.has_placeholder))


class BlockScopeHeader(BlockHeader):
    is_scope = True

    def __init__(self, scope, unscoped_value):
        self.scope = scope

        if unscoped_value:
            self.unscoped_value = unscoped_value
        else:
            self.unscoped_value = None


class UnparsedBlock(object):
    """A Sass block whose contents have not yet been parsed.

    At the top level, CSS (and Sass) documents consist of a sequence of blocks.
    A block may be a ruleset:

        selector { block; block; block... }

    Or it may be an @-rule:

        @rule arguments { block; block; block... }

    Or it may be only a single property declaration:

        property: value

    pyScss's first parsing pass breaks the document into these blocks, and each
    block becomes an instance of this class.
    """

    def __init__(self, parent_rule, lineno, prop, unparsed_contents):
        self.parent_rule = parent_rule
        self.header = BlockHeader.parse(prop, has_contents=bool(unparsed_contents))

        # Basic properties
        self.lineno = lineno
        self.prop = prop
        self.unparsed_contents = unparsed_contents

    @property
    def directive(self):
        return self.header.directive

    @property
    def argument(self):
        return self.header.argument

    ### What kind of thing is this?

    @property
    def is_atrule(self):
        return self.header.is_atrule

    @property
    def is_scope(self):
        return self.header.is_scope
