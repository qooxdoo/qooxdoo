# Technical view on the low-level APIs

<div class="note">

<div class="admonition-title">

Note

</div>

This document describes implementation details. The user API is covered in
%{Website} and the
`corresponding overview documentation </pages/website/overview>`.

</div>

## qx.bom - Browser Object Model

The classes contained in the `qx.bom` namespace provide a cross-browser
abstraction layer for object classes of the browser %{JS} runtime.

The BOM classes mainly consists of the following three parts:

- DOM element manipulation
- wrappers for native layers/objects
- powerful low-level helper classes

See the API reference of [qx.bom](apps://apiviewer/#qx.bom) for more details.

### DOM element manipulation

The `qx.bom.element` package allows you to manipulate DOM elements in almost any
way you can think of. Each class is offering several `static` methods that take
a DOM element as their first argument. Since those BOM classes are static, no
instances need to be created in order to manipulate a DOM element in the
document.

The following manipulations are offered by the `qx.bom.element` package:

<div class="index">

dimension, location, scroll, overflow, style, CSS, decoration, opacity,
animation, attribute, property, background, cursor

</div>

- Dimension and location
- Box-sizing - supports the modes `content-box` (W3C model) and `border-box`
  (Microsoft model)
- Scroll and overflow
- Style querying and modification
- CSS class name support - supports multiple class names for each element
- Scroll elements into view
- powerful low-level decoration support
- cross-browser support for opacity - optimized for animations
- CSS3 transforms and animations
- Attribute/Property handling
- Background images and support for the clip property
- Cursor property

### Wrapper for native layers/objects

These classes offer an unique and powerful way to deal with native layers and
objects. Wrappers exist for:

- the current document
- DOM elements to be connected to Qooxdoo's event system
- native event management
- flash embedding
- CSS font styles
- several native controls like `iframe`, `form elements`, `label` and `image`
  elements

As every object or layer is abstracted by a corresponding Qooxdoo class you can
use these BOM classes to interact without worrying about the underlying browser
used.

### Additional classes

These additional classes help in developing low-level, cross-browser
applications.

Features include:

- unified XMLHttp transport implementation
- powerful client detection classes
- low-level `Range` and `Selection` API
- helper class for browser history
- wrapper for working with CSS stylesheets
- string utility class
- helper class for the client's viewport
- helper class for VML

## qx.dom - Cross-browser DOM manipulation

The Document Object Model (DOM) is a tree model that represents the document in
a browser. The classes provided by this packages allow you to query, to
manipulate (i.e. add, remove, change order or replace) and to check the nodes
contained in the DOM.

Currently the `qx.dom` package consists of three classes:

- **Element**: manages children structures, inserts, removes and replaces nodes
- **Hierarchy**: for querying nodes
- **Node**: basic node creation and type detection

See the API reference of [qx.dom](apps://apiviewer/#qx.dom) for more details.

## qx.xml - XML handling

This package is all about working with XML documents in a cross-browser way. Its
three classes are:

- **Document**: creating an XML document
- **Element**: API to select, query and serialize XML elements
- **String**: escaping and unescaping of XML strings

See the API reference of [qx.xml](apps://apiviewer/#qx.xml) for more details.
