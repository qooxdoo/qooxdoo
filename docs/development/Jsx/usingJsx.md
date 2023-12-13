# Using Jsx

By utilizing Jsx, a lot more can be acomplished much more efficiently.

## Simplifying Table Creation

This example demonstrates how a large table can be created easily using Jsx.

> Note that this class is **only** an example, and probably won't do everything
your use case requires.

```jsx
qx.Class.define("qxjsx.page.SimplePage", {
  extend: qx.html.Element,

  construct() {
    super("main"); // use the `<main />` tag for this page's root element.

    this.add(
      <header>
        <h1>Important Business Report</h1>
      </header>
      <table>
        <thead>
          <tr>
            <th>Business</th>
            <th>More Business</th>
            <th>Somewhat Less Business</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Business</td>
            <td>Business</td>
            <td>Business</td>
          </tr>
          <tr>
            <td>Business</td>
            <td>Business</td>
            <td>Business</td>
          </tr>
          <tr>
            <td>Business</td>
            <td>Business</td>
            <td>Business</td>
          </tr>
        </tbody>
      </table>
    );
  }
});
```

However there's still the issue of repetition. Tables are a perfect example of
how tedious it can be to repeat the same code over and over again - if the data
if coming from an external source the issue becomes even more of a mess.

### Custom Elements

Using custom elements, any and all repetition can be completely removed. Custom
elements aren't just able to return Jsx, they can also return other custom
elements - or a deep structure of both.

```jsx
qx.Class.define("qxjsx.page.SimplePage", {
  extend: qx.html.Element,

  construct() {
    super("main"); // use the `<main />` tag for this page's root element.

    const component = qxjsx.page.SimplePage;

    this.add(
      <section>
        <header>
          <h1>Important Business Report</h1>
        </header>
        <table>
          <thead>
            <tr>
              <th>Business</th>
              <th>More Business</th>
              <th>Somewhat Less Business</th>
            </tr>
          </thead>
          <tbody>
            <component.row entries={["Business", "Business", "Business"]} />
            <component.row entries={["Business", "Business", "Business"]} />
            <component.row entries={["Business", "Business", "Business"]} />
          </tbody>
        </table>
      </section>
    );
  },

  // note: use static functions for custom elements, otherwise it is necessary 
  // to use `<this.myElem.bind(this) />`, which is ugly.
  statics: {
    row({ entries }) {
      return (
        <tr>
          {entries.map((entry) => (
            <td>{entry}</td>
          ))}
        </tr>
      );
    },
  },
});
```

It would be nice to be able to use the `row` element for the header as well, but
that would lead to poor semantics; `<td>` doesn't belong in the header. However,
Jsx is a very lenient syntax, and allows for the following workaround.

```jsx
//...
  <thead>
    <component.row
      entries={["Business", "More Business", "Somewhat Less Business"]}
      header
    />
  </thead>
//...
  statics: {
    row({ entries, header = false }) {
      // MUST start with a capital letter, otherwise Jsx will treat the tag name 
      //   of `<celltag>` as the string `"celltag"`
      const CellTag = header ? "th" : "td";
      return (
        <tr>
          {entries.map((entry) => (
            <CellTag>{entry}</CellTag>
          ))}
        </tr>
      );
    },
  },
//...
```

### Using Slots

Slots are an API custom elements can expose for controlling their child content.
For example, the newly added table element uses a named slot for the table
headings, and the default slot for the body.

```jsx
//...
  this.add(
    <section>
      <header>
        <h1>Important Business Report</h1>
      </header>
      <component.table>
        <component.row
          slot="headings"
          entries={["Business", "More Business", "Somewhat Less Business"]}
          header
        />
        <component.row entries={["Business", "Business", "Business"]} />
        <component.row entries={["Business", "Business", "Business"]} />
        <component.row entries={["Business", "Business", "Business"]} />
      </component.table>
    </section>
  );
//...
  statics: {
    table() {
      return (
        <table>
          <thead>
            <slot name="headings" />
          </thead>
          <tbody>
            <slot />
          </tbody>
        </table>
      );
    },
  },
//...
```

### Iterating Over Data

The final piece to this puzzle is dynamically generating rows. This is achieved
as it was within the `row` element, by providing an array of Jsx expressions
inside a value interpolation.

```jsx
  <component.table>
    <component.row
      slot="headings"
      entries={["Business", "More Business", "Somewhat Less Business"]}
      header
    />
    {myData.map((entries) => (
      <component.row entries={entries} />
    ))}
  </component.table>
```

This will generate the table as expected, regardless of whether there are only
a few rows or thousands.

## Controlling Print Pagination

When printing tables, browsers tend to automatically include the `<thead>` at
the top of each page when the table is split across multiple pages. This is 
typically quite helpful, but what if there's content to go at the top of each 
page which is not a table heading?

By using some basic CSS and a Jsx custom element with slots, this can be
accomplished quite easily.

> Note that this differs from the optional "headers and footers" some browsers 
offer, which are typically determined by the site url, current date, and page 
number.

```css
/* path/to/statics/myStyles.css
   included in the page `<head>` */

.print-control {
  width: 100%;
  display: table;
}

.print-control-header {
  width: 100%;
  display: table-header-group;
}

.print-control-body {
  width: 100%;
  display: table-row-group;
}

.print-control-footer {
  width: 100%;
  display: table-footer-group;
}
```

```jsx
//...
  const oneThousand = new Array(1_000).fill(); // an array of 1_000 `undefined`s
  this.add(
    <component.pageControl>
      <header slot="header">
        <h2>Every Page Heading</h2>
      </header>
      <footer slot="footer">
        <p>Every page footer</p>
      </footer>
      <div>
        {oneThousand.map(() => (
          <p>Some content!</p>
        ))}
      </div>
    </component.pageControl>
  );
//...
  statics: {
    pageControl() {
      return (
        <div class="print-control">
          <div class="print-control-header">
            <slot name="header" />
          </div>
          <div class="print-control-body">
            <slot />
          </div>
          <div class="print-control-footer">
            <slot name="footer" />
          </div>
        </div>
      );
    },
  },
```

This mechanism can contain other instances of itself, allowing for nested
pagination control for different sections of the page.

