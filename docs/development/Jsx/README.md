# Jsx: Static Documents to Support Your Qooxdoo Application

Jsx can be used to generate supporting documents to your Qooxdoo application,
such as printable media. It can also be serialized on the server, boasting a
huge reduction in load time for these supporting documents.

## Jsx and Qooxdoo - How Do They Connect?

Qooxdoo Desktop is a system for, amongst other things, building user interfaces
and Single Page Applications without using HTML or CSS - Jsx on the other hand
almost *is* HTML.

The connection between Jsx and Qooxdoo is in their differing abilities. While a
desktop application can be built in Qooxdoo with relative ease, it's not
possible to create `qx.ui.*` on the server, let alone serialize that to the
client where (for example) we can then allow the browser to paginate web content
for printing.

Enter Jsx. Jsx transpiles down to basic calls to Qooxdoo's virtual DOM mechanism
and builds a markup document directly. This bypasses the layout system, 
introducing a need for CSS. There are no user interface components, or anything
for interacting with the end user in the way that a Qooxdoo Desktop (ie Single
Page Application) would interact with the user. Instead, QxJsx's stripped back
feature-set and disconnect from `qx.ui.*` makes it ideal for representing large
structures of data (eg, invoices or reports) as printable HTML pages.

By building into a server calls to serialize (ie pre-render) the Jsx, it becomes
increasingly beneficial to both the developer and the user to have a lighter and
lower-level system for building these static documents.

## Getting Started

- [QxJsx Syntax](/development/Jsx/QxJsx.md) - Learn the Jsx syntax and QxJsx's
  custom features
- [Server Side Rendering](/development/Jsx/SSR.md) - Understand how 
  `qx.html.*`'s serialization can be utilized on the server
- [Using Jsx](/development/Jsx/usingJsx.md) - See examples of how Jsx is used to
  write large static documents with minimal code
