HTML Element Handling
=====================

This document describes the ideas and concepts behind the classes in the `qx.html` namespace ([API](http://api.qooxdoo.org/#qx.html)). qooxdoo also comes with a basic low-level abstraction API for DOM manipulation. For details about this API please have a look at the corresponding documentation \</pages/website/tech\_website\_apis\>.

Idea
----

The classes in `qx.html` are wrapper for native DOM elements, which basically were created to solve one major issue:

**Automatically keeping care of DOM manipulation and creation while dealing with large number of elements.**

In details this means:

> -   **Automatic performance**: Programmatically constructing DOM hierarchies is hard to get fast because the order in which elements are nested can heavily influence the runtime performance. What `qx.html.Element` does is trying to keep the number of element instances to the minimum actually needed (DOM nodes are expensive, both performance and memory aside) and to insert the DOM nodes in an efficient manner. Further all changes to the DOM are cached and applied in batch mode, which improves the performance even more.
> -   **Normalized API**: Working with HTML DOM elements usually involves many browser switches. Especially when it comes to reading and setting of attributes or styles. For each style one has to remember whether a normalization method should be called or if the value can be set directly. `qx.html.Element` does this kind of normalization transparently. The browser normalization is based on the existing low-level APIs \</pages/website/tech\_website\_apis\>.
> -   **Convenience methods**: These elements have additional convenience API, which is not available on pure DOM elements. They have e.g. the functionality to manage children with methods like `addBefore()` or `moveAfter()`.

Typical Use Cases
-----------------

> -   Building a widget system on top
> -   Massively building DOM elements from data structures

It may be used for smaller things as well, but brings in quite some overhead. The size of the API, additional to a basic low-level package of qooxdoo is about 20 KB (5 KB gzipped). Also it consumes a bit more memory when all underlying DOM elements are created. Keep in mind that the instances are around all the time. Even when all jobs for a instance are done at the moment.

Features
--------

> -   Automatic DOM insertion and element management
> -   Full cross-browser support through usage of low-level APIs e.g. `setStyle()`, `getAttribute()`, ...
> -   Advanced children handling with a lot of convenience methods e.g. `addAfter()`, ...
> -   Reuse existing markup as a base of any element via `useMarkup()`
> -   Reuse an existing DOM node via `useElement()`
> -   Powerful visibility handling to `include()` or `exclude()` specific sub trees
> -   Support for scrolling and scroll into view (`scrollTo()`, `scrollIntoView()`, ...)
> -   Integration of text selection APIs (`setSelection()`, `getSelection()`, ...)
> -   Automatic interaction with event managers (`addListener()`, `removeListener()`, ...)
> -   Connection to focus/activation handler

Specific HTML Elements
----------------------

### Roots

A root is one essential element type when dealing with the API. Every user of `qx.html.Element` needs at least one instance of `qx.html.Root` to insert children to it. The root is always marked as being visible and is typically the body DOM element or any other directly inserted element. This element can be assigned to be used by the root using the method `useElement()`.

### Labels

Used for all types of text content. Supports text or HTML content togglable using the `setRich()` method. When using the text mode ellipsis is supports in all browsers to show an indication when the text is larger than the available space. Highly depends on the API of [qx.bom.Label](http://api.qooxdoo.org#qx.bom.Label).

### Images

An element pre-configured as a `IMG` tag. Supports scaled and unscaled images. Supports image clipping (without scaling) to more efficiently deal with a lot of images. Depends on the API brought in by [qx.bom.element.Decoration](http://api.qooxdoo.org#qx.bom.element.Decoration).

### Input

This element is used for all types of input fields. The type can be given using a constructor parameter. It allows configuration of the `value` and the text wrapping (requires type `textarea`). Depends on the API brought in by [qx.bom.Input](http://api.qooxdoo.org#qx.bom.Input).

### Iframe

This element is used to create iframes to embed content from other sources to the DOM. It wraps the features of [qx.bom.Iframe](http://api.qooxdoo.org#qx.bom.Iframe). Supports to configure the source of the iframe as well as its name. Comes with accessors to the document or window object of the iframe.

### Canvas

Renders a [HTML5 Canvas](https://html.spec.whatwg.org/multipage/scripting.html#the-canvas-element) to the DOM. Has methods to access the render context as well to configure the dimensions of the Canvas.

The Queue
---------

Internally most actions applied to the instances of `qx.html.Element` are applied lazily to the DOM. All style or attribute changes are queued for example to set them at once. This is especially useful to allow to bump out changes at once to the browser even when these happens in multi places and more important on more than one element.

Even things like focus handling or scrolling may be queued. It depends on if the element is currently visible etc. whether these are queued. `focus` makes often more sense when it is directly executed as the following code may make assumptions that the changes are applied already. Generally qooxdoo allows it to apply most changes without the queue as well using a `direct` flag which is part of most setters offered by `qx.html.Element`.
