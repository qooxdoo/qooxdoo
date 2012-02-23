.. _pages/mobile/theming#theming:

Theming
*******

CSS and LESS
============

Theming in qooxdoo mobile is done with `LESS <http://www.lesscss.org/>`_ and CSS. LESS is an extension of CSS for enabling style sheets to be dynamic. 
In LESS you can you use variables, reuse CSS statement inside of CSS file, import CSS files and create mixins.

If you want to extend or change the qooxdoo mobile themes, you always should modify LESS files (\*.less) in folder 
"framework/source/resource/qx/mobile/less". After you modified LESS files, they have to be parsed into CSS.

The target CSS artefacts can be found in folder "framework/source/resource/qx/mobile/css". Please notice: You should not change these files.

Parsing LESS files
==================

There different ways for parsing LESS files into CSS. 

* `LESS website <http://www.lesscss.org/>`_: If you are working on source variant of qooxdoo mobile, you can include less.js, and link LESS in output file directly. More details about this variant, can be found on official .

* `Guard-LESS <https://github.com/guard/guard-less>`_: A guard extension that compiles .less files to .css files when changed.  It listens on folders or set of LESS files for changes, and triggers re-compiling of CSS files automatically. This should be your choice, if you are familar to guard.

* `Simpless <http://wearekiss.com/simpless>`_: Similar to functionality of Guard LESS, but with more comfortable usage, because of UI is an application called . It also compiles LESS to CSS files automatically on file change. Simpless is available for every platform (Windows, Mac OS, Linux).


