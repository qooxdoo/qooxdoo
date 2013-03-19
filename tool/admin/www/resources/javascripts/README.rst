Manifest of this directory
===========================
This directory holds an assortment of JavaScript files which are used on our
web site, some of them 3rd party scripts, some standard components from our
repo, some custom scripts maintained here in this location.

File List
------------
* application.js
  Main custom script using q and q plugins; maintained here.
* html5shiv.js
  3rd party. Helper for HTML5 elements in older IEs.
* q.domain.js
  Custom q plugin, handles the qx components display (tabs, code, etc.)on the
  homepage. Maintained here.
* q.js
  q.core. Maintained in component/standalone/website. Please generate there and
  copy over here (Yes, we maintain a copy here checked-in, to have better
  control of what goes onto the web site).
* q.placeholder.js
  Custom q plugin; maintained here.
* q.sticky.js
  Custom q plugin, handles the controls of the right side bar so they are always
  visible. Maintained in component/library/q.sticky.
* README.rst
  This file.
* shBrushJScript.js
  3rd party. Syntax highlighter.
* shCore.js
  3rd party. Syntax highlighter.

Maintenance
------------
* Please maintain standard components in their original location, and copy
  resulting scripts here.
* Update 3rd party scripts from their original location/URL, as required,
  keeping licenses in sync.
* Develop custom scripts in this directory directly if so indicated in the
  above list.
