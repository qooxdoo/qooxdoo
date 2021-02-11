# JSDoc Reference

The declarative language used in JSDoc-like comments in Qooxdoo has grown
including specific extensions, maybe in some cases deviating from the
[official implementation](https://jsdoc.app/), so it makes sense to summarize
the supported constructs.

> Note: Up until version 5, Qooxdoo's API documentation required placing the
> type of the parameter after the parameter name (`@param name {String}`), which
> is in violation of the JSDoc specification to have the type precede the name
> (`@param {String} name`). In Qooxdoo v6, both syntaxes are permitted, but we
> strongly advise to follow the JSDoc spec here, since the old format is
> deprecated and might be dropped in a future version.

## Overall JSDoc Structure

A doc comment appears right before the structure (class, property, method or
constant) it describes. It begins with `/**` and ends with `*/`. The rows in
between start with a `*` followed by the text of the particular row. Within this
frame there is a description text at the beginning. Afterwards attributes may
follow, describing more aspects.

Description texts may also include HTML tags for a better structuring.

An example:

```javascript
    /**
    * Handles a drop.
    *
    * @param {qx.bla.DragSource} dragSource The drag source that was dropped.
    * @param {Element} targetElement The target element the drop aims to.
    * @param {Integer|null} dropType  the drop type. This is the same type
    *        as used in {@link qx.bla.DragEvent}.
    * @return {Boolean} whether the event was handled.
    * @throws {Error} if the targetElement is no child of this drop target.
    *
    * @see #getDragEvent
    * @see qx.bla.DragEvent
    */
    handleDrop(dragSource, targetElement, dropType) {
      //...
    }
```

### Inline Markup

Running text can be formatted using basic
[MarkDown syntax](https://www.markdownguide.org/basic-syntax/). If that does not
suffice, there is limited support for HTML markup.

## Attributes / Documentation Tags

After the general description text there may follow any number of attributes or
"documentation tags" (as the JSDoc3 spec calls them). They all have a common
general syntax:

```
'@' <key> <key_data>
```

That is they all start with an at-sign, `@`, as the first thing on a line within
the JSDoc comment block. Then follows a special key from a pre-defined set of
keys, like param, return, throws and the like. The key data is then key-specific
and varies a bit. There might be keys that have no data at all. Some use a
parenthesized syntax to indicate arguments (like "@ignore(foo)"), other use a
more verb-like syntax (like `@deprecated {<version>} use bar instead`). Many of
them allow free comment text at the end. See the Section Reference\_ for a full
list of supported attributes and their individual syntaxes.

A new attribute entry or the end of the JSDoc comment terminate an attribute
specification. Attributes may stretch across multiple lines. Lines following an
attribute key are logically appended to the first line (i.e. the effect is as if
you had written one long line).

You can **comment out** an attribute by just prefixing it with another `@`, like

```
@@ignore(foo)
```

Then this attribute will simply be ignored.

The following sections before the reference list of supported attributes give
some general information that apply to some of them.

## Handling of Data Types

Because JavaScript has no strong typing, the types of the parameters accepted by
a method may not be read from the method's definition. For showing the accepted
types in the API documentation the data type may be specified in the doc
attributes `@param` and `@return`.

The following type indicators are accepted:

- **Primitive**: `var`, `void`, `undefined`

- **Builtin classes**: `Object`, `Boolean`, `String`, `Number`, `Integer`,
  `Float`, `Double`, `Regexp`, `Function`, `Error`, `Map`, `Date`, `Element`

- **Other classes**: Here the full qualified name is specified (e.g.
  `qx.ui.core.Widget`). If the referenced class is in the same package as the
  currently documented class, the plain class name is sufficient (e.g.
  `Widget`).

- **Lists**: Homogenous lists are indicated by adding one or more `[]` to the
  type, e.g. `String[]`, `Integer[][]`.

### Syntax of a Type Specification

Here is the full syntax for a type specification as used in concrete doc
attributes:

```
{ [ Type1 | Type2 | ... [ ? [<default_value]]  ] }
```

That is, between curly braces an optional list of type indicators (as described
above), separated by `|`, following an optional `?` to indicate the entire
parameter is optional, followed by an optional default value (the last two for
`@param` attributes).

For a parameter description the meaning is: The expected parameter can be of
Type1 or Type2 or ..., is optional, i.e. can be left out, and will default to
_(default_value)_.

**Example**:`{String|Integer ? null}`

## Matching of Names in Code

Many of the JSDoc keys take some sort of symbol names as parameters, e.g. the
`foo` in `@ignore(foo)`, which are then matched against names found in the code.
These parameters include global variables, built-in functions, function
arguments, namespaces, and the like. It is important that you are aware of the
semantics of those parameters, i.e. the way they are used to establish a match
with a name actually found in the code. The left arrow in the schematics, `->`,
can be read as "matches".

- **Exact Match**

  The name matches the parameter exactly. Some keys restrict themselves to exact
  matches, e.g. the _alert_ in `@lint ignoreDeprecated(alert)` will only match
  the global symbol _alert_ in the code, neither _aler_ nor _alerty_ nor
  _alert.foo_.

  ```
  foo (parameter) -> foo (name)
  ```

  The following match types include exact match, but also allow other kinds of
  matches. Non-exact matches always honor object boundaries (not just simple
  string prefixes), so e.g. `foo` might match `foo.bar` but will never match
  `foobar`.

- **Prefix Match**

  The name matches a prefix of the parameter. Some keys regard the name from the
  code as a (pot. complete) prefix of their parameters. E.g. if you use
  `foo.bar.baz` as a parameter, `foo`, `foo.bar` and `foo.bar.baz` will be
  matched.

  ```
  foo.bar (parameter) -> foo (name)
  ```

- **Extension Match**

  The parameter matches a prefix of the name. Some keys regard the parameter as
  a prefix of the name from the code, again usually restricting it to object
  boundaries. In that case, a name `foo.bar` will match a parameter of `foo`,
  while the name `foozy` will not.

  ```
  foo (parameter) -> foo.bar (name)
  ```

- **Wildcard Match**

  Some keys need an explicit, glob-style wildcard at the end to support
  extension matches. In that case you need to provide a parameter like `foo.*`,
  in order to match a name of `foo.bar` from the code . Again, a match has to
  honor object boundaries. In the case of a wildcard like `foo.*`, a simple
  `foo` will also be matched, so the exact match (without dot and wildcard) is
  included.

  ```
  foo.* (parameter) -> foo.bar (name)
  ```

The individual tags should make it clear which of those match semantics they use
when checking actual code names. Many keys will allow not only one parameter,
but a list of parameters. Matching is then applied to each parameter in turn,
and if one of them matches the key applies.

## Section Reference

For a detailed list of tags and their usage, please refer to the  
[Qooxdoo v5 JSDoc reference list](http://archive.qooxdoo.org/5.0.2/pages/development/api_jsdoc_ref.html#section-reference).
Note that the tags `@lint`, `@group`,`@cldr`, `@attach`, `@attachStatic`,
`@tag`, and `@signature` described in this list are no longer supported and will
be ignored.
