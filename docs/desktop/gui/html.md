HTML Element Handling
=====================

This document describes the ideas and concepts behind the classes in the `qx.html` namespace ([API](apps://apiviewer/#qx.html)). qooxdoo also comes with a basic low-level abstraction API for DOM manipulation. For details about this API please have a look at the [corresponding documentation](../../core/tech_website_apis.md).

Idea
----

The classes in `qx.html` are wrappers around native DOM elements, which were created primarily to solve one major issue:

**Automatically keeping care of DOM manipulation and creation while dealing with large number of elements.**

In details this means:

> -   **Automatic performance**: Programmatically constructing DOM hierarchies is hard to get fast because the order in which elements are nested can heavily influence the runtime performance. What `qx.html.Element` tries to do is keep the number of element instances to the minimum actually needed (DOM nodes are expensive, in terms of both performance and memory) and to insert the DOM nodes in an efficient manner. Further, all changes to the DOM are cached and applied in batch mode, which improves the performance even more.
> -   **Normalized API**: Working with HTML DOM elements usually involves many browser differences, especially when it comes to reading and setting of attributes or styles. For each style, one has to remember whether a normalization method should be called or if the value can be set directly. `qx.html.Element` does this kind of normalization transparently. The browser normalization is based on the [existing low-level APIs](../../core/tech_website_apis.md).
> -   **Convenience methods**: These elements have an additional convenience API, which is not available on pure DOM elements. They have e.g. the functionality to manage children with methods like `addBefore()` or `moveAfter()`.

Typical Use Cases
-----------------

> -   Building a widget system on top
> -   Massively building DOM elements from data structures

It may be used for smaller things as well, but incurs a large overhead. The size of the API, additional to a basic low-level package of qooxdoo is about 20 KB (5 KB gzipped). Also it consumes a bit more memory when all underlying DOM elements are created. Keep in mind that the instances are around all the time. Even when all jobs for a instance are done at the moment.

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

A root is one essential element type when dealing with the API. Every user of `qx.html.Element` needs at least one instance of `qx.html.Root` to insert children into. The root is always marked as being visible and is typically the body DOM element or any other directly inserted element. This element can be assigned to be used as the root, using the method `useElement()`.

### Labels

Used for all types of text content. Supports text or HTML content togglable using the `setRich()` method. When using the text mode, ellipsis is supported in all browsers, to show an indication when the text is larger than the available space. Highly depends on the API of [qx.bom.Label](apps://apiviewer/#qx.bom.Label).

### Images

An element pre-configured as a `IMG` tag. Supports scaled and unscaled images. Supports image clipping (without scaling) to more efficiently deal with a lot of images. Depends on the API brought in by [qx.bom.element.Decoration](apps://apiviewer/#qx.bom.element.Decoration).

### Input

This element is used for all types of input fields. The type can be given using a constructor parameter. It allows configuration of the `value` and the text wrapping (requires type `textarea`). Depends on the API brought in by [qx.bom.Input](apps://apiviewer/#qx.bom.Input).

### Iframe

This element is used to create iframes to embed content from other sources to the DOM. It wraps the features of [qx.bom.Iframe](apps://apiviewer/#qx.bom.Iframe). Supports to configure the source of the iframe as well as its name. Comes with accessors to the document or window object of the iframe.

### Canvas

Renders a [HTML5 Canvas](https://html.spec.whatwg.org/multipage/scripting.html#the-canvas-element) to the DOM. Has methods to access the render context as well to configure the dimensions of the Canvas.

The Queue
---------

Internally, most actions applied to the instances of `qx.html.Element` are applied lazily to the DOM. All style or attribute changes are queued, for example, to set at one time. This is especially useful to allow bumping out changes at once to the browser even when these happen in multi places, and more importantly, on more than one element.

Even things like focus handling or scrolling may be queued. It depends on if the element is currently visible, etc., to determine whether these are queued. `focus` often makes more sense when it is directly executed, as the following code may make assumptions that the changes are applied already. Generally Qooxdoo allows it to apply most changes without the queue, as well, using a `direct` flag which is part of most setters offered by `qx.html.Element`.
