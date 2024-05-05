# Server Side Rendering

This guide goes through the process of building a server side rendered document
using the Qooxdoo server template and the Express server framework.

## Creating the Application

For this demonstration, a basic Express server will be used. Any Node.js server
however will work, provided it can be `require()`d.

> Note that this class is **only** an example, and probably won't do everything
your use case requires.

```js
qx.Class.define("qxjsx.Application", {
  extend: qx.application.Basic,

  members: {
    main() {
      const express = require("express");
      express()
        // Use the static middleware - this will serve all files in the static folder (eg CSS)
        .use(express.static("path/to/statics"))
        // Define a route for the page
        .get("/simplePage", (req, res) => {
          // create the page
          const simplePage = new qxjsx.page.SimplePage();
          // serialize the page
          const serialized = this.serializePage(simplePage);
          // send serialized page
          res.send(serialized);
        })
        // Launch the server on port 5173 (port "SITE")
        .listen(5173, () => console.log(`http://localhost:5173/`));
    },

    serializePage(page) {
      return [
        "<!DOCTYPE html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="UTF-8" />',
        "    <!-- include styles, title, and other metadata -->",
        "  </head>",
        "  <body>",
        `    ${page.serialize()}`,
        "  </body>",
        "</html>"
      ].join("\n");
    }
  }
});
```

It's that simple. Whatever content is added to `qxjsx.page.SimplePage` will be 
serialized on the server and sent to the client as a static HTML document.

## Creating the Page 

Pages are incredibly simple in the design being used by the server shown above;
any class which extends `qx.html.Element` can be used as a page.

> Note that this class is **only** an example, and probably won't do everything
your use case requires.

```js
qx.Class.define("qxjsx.page.SimplePage", {
  extend: qx.html.Element,

  construct() {
    super("main"); // use the `<main />` tag for this page's root element.

    this.add(new qx.html.Element("h1").set({ text: "Hello World!" }));
  }
});
```

Running the server at this stage will result in a page with the text "Hello
World!" being rendered on the server and sent to the client.

But instantiating `Element`s in this way is quite cumbersome for something
intended to be quite light and basic. Instead, using Jsx would be much more
convenient. 

[Read on](/development/Jsx/usingJsx.md) to see Jsx in action.