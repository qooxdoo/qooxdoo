# QxJsx

QxJsx is qooxdoo's own flavor of the popular JSX syntax for declaratively
creating DOM and VDOM elements.

```jsx
const color = "red";
const myQxJsx = (
  <header>
    <h1 style={`color: ${color};`}>Hello, QxJsx!</h1>
  </header>
);
```

## Custom elements

Any function (including constructor functions) may be used as a custom element
tag, the restrictions are;

1. The return value must be an instance of [qx.html.Node](apps://apiviewer/#qx.html.Node).
2. The name must be a property access (eg, `foo.bar`), or must start with a
   capital letter (eg, `Foo`).

Custom elements are provided with one argument which is the attributes passed
to the QxJsx element. Attributes can provide a default value by destructuring as
shown.

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

### Slots

Slots are used to add children to custom elements. Multiple slots may be used
to define several places for child content. Only one slot may omit the `name`
attribute and be the default slot.

Slots may specify default content to display if none is provided.

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

## Additional Syntax

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

### Spread Attributes

In case all of the attributes which are to be passed to an element are in an
existing POJO, they can be passed down using the spread operator.

```jsx
const attrs = {
  id: "my-id",
  class: "my-class",
  style: "color: red;",
};

const dont_do_this = (
  <h1 id={attrs.id} class={attrs.class} style={attrs.style}>Lorem ipsum</h1>
);

const just_do_this = <h1 {...attrs}>Lorem ipsum</h1>;
```

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

### React Workarounds

In other Jsx flavors such as ReactJsx, some attributes and tagnames cannot be
used, such as `for`, or `class`, and have workarounds such as `htmlFor` or
`className`. This is not needed in QxJsx.

### CSS Custom Properties

(AKA CSS Variables)

Styling the DOM directly is a necessity when working with HTML via JSX, however
this can be difficult via the theme system. In cases where the element which
needs to be styled is deeper inside a hierarchy of [custom elements](#custom-elements),
this becomes an increasing issue.

To control the style of a deeply nested custom element, the custom element can
provide an API of CSS variables which may be set anywhere higher in the cascade.
The main advantage of using CSS variables over JavaScript values is a drastic
increase in rendering performance, however there is nothing to prevent the use
of JavaScript values when they are needed.

To pass CSS Custom Properties to an element, attributes prefixed with a double
underscore can be used.

```jsx
/**
 * @css {Color} [color=blue] the color applied to the default slot
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
