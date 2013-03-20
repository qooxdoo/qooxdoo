JavaScript Resources
=======================

This directory is copied with its contents to our online website. It holds an
assortment of JavaScript files which are used there, some of them 3rd party
scripts, some of them custom scripts maintained in the repo.

Files
------------

Custom
~~~~~~~
* Custom q, q plugins and scripts; maintained in ../q.websites/.

  * application.js -- Main custom script using q and q plugins.
  * q.js -- Custom q build (q.core + addtl. modules)
  * q.domain.js -- q plugin, handles the qx components display (tabs,
    code, etc.)on the homepage
  * q.placeholder.js -- q plugin.
  * q.sticky.js -- q plugin, handles the controls of the right side bar
    so they are always visible.

Third-party
~~~~~~~~~~~
* html5shiv.js
  3rd party. Helper for HTML5 elements in older IEs.
* SyntaxHighlighter
  3rd party. Syntax highlighter.

  * shBrushJScript.js
  * shCore.js
  * sh.LICENSE


Maintenance
------------
* Please maintain custom components in their original location, and copy
  resulting scripts here.
* Develop custom scripts in this directory directly if so indicated in the
  above list.
* Update 3rd party scripts from their original location/URL, as required,
  keeping licenses in sync.
