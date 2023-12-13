# QxJsx Syntax

QxJsx is the name for Qooxdoo's flavor of Jsx. It is a small yet powerful
extension to the Jsx syntax, taking proven concepts from popular frameworks such
as Svelte and React and integrating them into Qooxdoo's own Jsx.

## Standard Behaviors

These features are standard across most if not all Jsx flavors.

### Custom Elements

Any function (including constructor functions) may be used as a custom element
tag, the restrictions are;

1. The return value must be an instance of [qx.html.Node](apps://apiviewer/#qx.html.Node).
2. The 'tag' name must be a property access (eg, `foo.bar`), or must start with
   a capital letter (eg, `Foo`).

Custom elements are provided with one argument which is the attributes passed to
the QxJsx element. Attributes can be provided a default value by destructuring
as shown.

Custom elements with slots can be nested without concern about conflicting slot
names. Slots are only passed to the component they are an immediate child of.

```jsx
/**
 * @param {object} arg0
 * @param {string} arg0.who
 */
const MyCustomElem = ({ who = "nobody :(" }) => {
  return <p>Hello, {who}</p>;
}
const world = <MyCustomElem who="world" />;
```

```jsx
qx.Class.define("ElementClass", {
  extend: qx.html.Element,
  construct(attributes) {
    super("div");
    this.add(
      <>
        {/* some Jsx here */}
      </>
    );
  }
})
// later...
const myElementClass = <ElementClass attr1="val1" />;
```

### Spread Attributes

In case all of the attributes which are to be passed to an element are in an
existing POJO, they can be passed down using the spread operator.

```jsx
const attrs = {
  id: "my-id",
  class: "my-class",
  style: "color: red;",
};

const dontDoThis = <h1 id={attrs.id} class={attrs.class} style={attrs.style}>Lorem ipsum</h1>;

const justDoThis = <h1 {...attrs}>Lorem ipsum</h1>;
```

Spread attributes can be combined with key-value attributes to override spread
keys or to pass keys not defined by the spread object.

### Fragments

To create an array of elements, a fragment can be used. a fragment is simply an
html tag with no name.

```jsx
const myFragment = (
  <>
    <h1>Hello</h1>
    <h2>World</h2>
  </>
);
```

Note that a fragment is simply a `qx.data.Array`; it is not it's own form of Jsx
element, and has limited capabilities within Jsx expressions.

<!-- TODO: future addition
To use an enhanced fragment with additional behaviors, use the [`qx:fragment`](#qx-fragment)
special element.
-->

### Comments

To add a comment inside a QxJsx expression, wrap an inline comment in curly
braces.

```jsx
const myElem = (
  <div>
    {/* this is a comment */}
    <p>Hello, World!</p>
  </div>
);
```

## Custom Behaviors

These features are custom additions to Jsx and are not standard across all Jsx
flavors. They are inspired by popular frameworks such as Svelte and React,
differing in logical ways to work with each other and with Qooxdoo.

### Slots

Inspired by Native Custom Elements.

Slots are used to add nested children to custom elements. Multiple slots may be
used to define several places for child content.
Slots may specify a `name` attribute. This is useful for when there are multiple
slots to choose from. Only one slot may omit the `name` attribute, this slot
will be used as the 'default' slot.

Slots may specify default content to display if none is provided, declared as
child JSX content.

```jsx
/**
 * @param {object} arg0
 * @param {string} arg0.who
 *
 * @slot default - the heading. If omitted, is an `h1` displaying "Hello, {who}"
 * @slot name="subheading" - a subheading
 */
const MyCustomElem = ({ who = "nobody :(" }) => {
  return (
    <header>
      <slot>
        <h1>Hello, {who}</h1>
      </slot>
      <slot name="subheading" />
    </header>
  );
}

// default heading, no subheading
const usage1 = <MyCustomElem />;

// custom heading, no subheading
const usage2 = (
  <MyCustomElem>
    <h1>Custom heading</h1>
  </MyCustomElem>
);

// custom heading, custom subheading
const usage3 = (
  <MyCustomElem>
    <h1>Custom heading</h1>
    <h2 slot="subheading">Custom subheading</h2>
  </MyCustomElem>
);

// default heading, custom subheading
const usage4 = (
  <MyCustomElem>
    <h2 slot="subheading">Custom subheading</h2>
  </MyCustomElem>
);
```

### React Workarounds

Inspired by React.

In other Jsx flavors such as ReactJsx, some attributes and tag names cannot be
used, such as `for`, or `class`, and have workarounds such as `htmlFor` or
`className`.
Such workarounds are not needed in QxJsx, though for a smoother onboarding
experience these attributes have special handling and will work the same as
their native equivalents.

### CSS Custom Properties

Inspired by Svelte.

Styling the DOM directly is a necessity when working with HTML via Jsx. In cases
where the element which needs to be styled is deeper inside a hierarchy of
[custom elements](#custom-elements), this becomes an increasing issue.

To control the style of a deeply nested custom element, the custom element can
provide an API of CSS variables which may be set anywhere higher in the cascade.
The main advantage of using CSS variables over JavaScript values is a drastic
increase in rendering performance both in the browser and in SSR, however there
is nothing to prevent the use of JavaScript values when they are needed.

To pass CSS Custom Properties to an element, attributes prefixed with a double
underscore can be used. This mechanism is only available on custom elements; it
will not work on native elements or custom shadow DOM elements.

```jsx
/**
 * @css {Color} [my-custom-property=blue] the color applied to the default slot
 *
 * @slot default - paragraph content
 */
const SomeText = () => (
  <p style="color: var(--my-custom-property, blue);">
    <slot/>
  </p>
);

const myElem = <SomeText __my-custom-property="red">This is red!</SomeText>;
```

### Namespaced Elements

It is possible to use non-HTML namespaced elements depending on the setup of
your page (this section is not a guide to XML namespaces). Some Jsx flavors
don't allow the use of namespaces - QxJsx however does.

The `qx:*` namespace is reserved for use by QxJsx itself for tags with unique
custom behaviors. Currently, no such tags exist, but they may be added in the
future.

<!-- TODO: future addition
#### Qx:Fragment

...&c
-->