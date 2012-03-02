.. _pages/mobile/theming#theming:

Theming
*******

CSS and LESS
============

Theming in qooxdoo mobile is done with `LESS <http://www.lesscss.org/>`_ and CSS. LESS is an extension for CSS to enable style sheets to be more dynamic.
In LESS you can you use variables, reuse CSS statement inside of CSS file, import CSS files and create mixins.

If you want to extend or change the qooxdoo mobile themes, you always should modify LESS files (\*.less) in folder
"framework/source/resource/qx/mobile/less". After you modified LESS files, they have to be parsed into CSS.

The target CSS artefacts can be found in folder "framework/source/resource/qx/mobile/css". Please notice: You should not change these files.

Example usage of LESS in qooxdoo mobile
=======================================

When you inspect LESS files of qooxdoo mobile, you will see that there are two main files (android and ios.less).
These two files consists out of several parts, which are imported with command:

::

    @import "_base";

The files *_android.less* and *_ios.less* both import *_base.less*, which contains *_mixins.less*.
The *_mixins.less* is a important part, because it contains most important mixins
used in any LESS file. For example the LESS mixin for border-radius:

::

    .border-radius() {
        -webkit-border-radius: @arguments;
        -moz-border-radius: @arguments;
        border-radius: @arguments;
    }

This mixin helps you creating border-radius for most browsers,
just by writing something like:

::

    .border-radius(4px);

Another mixin example for buttons can be found in file *_android.less*.
In this case, mixins are used like inheritance classes.
There is a class with typical look and feel for Android buttons,
called *.standard-button*.

::

    .standard-button {
        @button-color: #f4f4f4;
        @height: 20px;

        .border-radius(4px);
        cursor: pointer;
        width: auto;
        height: 20px;
        color: #222222;
        text-align: center;

        // Less "darken method" helps to make use of android-button easier.
        // It takes button-color and darkens it. No second gradient color
        // is needed.
        #gradient > .vertical(@button-color, darken(@button-color, 20%));
        border: 1px solid #555555;
        line-height: @height;
        font-size:12px;
    }


The toolbar button extends this standard button, and adds some
special values.

::

    .toolbar-button {
        .standard-button();
        height: 50px;
        font-size: 17px;
    }

So you are able to use inheritance directly in LESS file, which might give you a
better overview than applying multiple CSS classes to one DOM element.


Parsing LESS files
==================

There are different ways for parsing LESS files into CSS.

* `LESS.js <http://www.lesscss.org/>`_: If you are working on source variant of qooxdoo mobile, you can include less.js and link LESS in the application ``index.html`` file directly. Just uncomment the following lines in the ``index.html`` file:

::

  <!-- Uncomment the following block to use less.js -->
  <!-- <link rel="stylesheet/less" type="text/css" media="screen" href="../../../framework/source/resource/qx/mobile/less/android.less">
  <link rel="stylesheet/less" type="text/css" media="screen" href="resource/mobileshowcase/css/styles.css">
  <script type="text/javascript" src="https://raw.github.com/cloudhead/less.js/master/dist/less-1.1.6.min.js"></script> -->


* `Guard-LESS <https://github.com/guard/guard-less>`_: A guard extension that compiles .less files to .css files when changed. It listens on folders or a set of LESS files for changes, and triggers re-compiling of CSS files automatically. This should be your choice, if you are familar to guard.

* `Simpless <http://wearekiss.com/simpless>`_: Similar to functionality of Guard-LESS, but with more easier configuration and usage, because of a graphical user interface. It also compiles LESS to CSS files automatically on file change. Simpless is available for every platform (Windows, Mac OS, Linux).


