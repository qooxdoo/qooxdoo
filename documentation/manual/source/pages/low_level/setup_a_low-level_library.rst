.. _pages/setup_a_low-level_library#setup_a_low-level_library:

Setting up a low-level library
*******************************

A low-level library is interesting for all those who like to use the :doc:`low-level APIs <low_level_apis>` of qooxdoo. Such a library consists of a pre-build javascript file that contains only the low-level classes of qooxdoo. For instance, no GUI toolkit (widgets, layouts, theming) is included.

.. _pages/setup_a_low-level_library#create_a_low-level_skeleton:

Create a low-level skeleton
===========================

To create your low-level application skeleton you can let do the tool-chain the heavy lifting and use the ``create-application.py`` script to generate the skeleton.

::

    $QOOXDOO_PATH/tool/bin/create-application.py -n appName -t bom -o $OUTPUT-DIR

The ``t`` parameter is the important one to define the application as a ``bom`` type application. To show all available options of this mighty script just type 

::

    $QOOXDOO_PATH/tool/bin/create-application.py ?

.. _pages/setup_a_low-level_library#generate_qooxdoo_build:

Generate qooxdoo build
======================

Looking at the output of your generated low-level library skeleton you first realize that no ``source`` folder exists. The simple reason for this is, that you can easily use the low-level APIs without creating your own application classes. Instead you add your logic directly into the given ``index.html`` or in whatever HTML file you like to.

Before you can descend to the low-levels you have to generate a javascript file containing the qooxdoo low-level classes.

::

    ./generate.py build

This pre-defined job is all you have to execute to start right away.

.. note::

    The generated build script is a compilation of low-level classes, but it does **not** provide all classes of the *qx.bom* or *qx.dom* namespace. Please take a look at the provide *config.json* file to determine which file is included. The low-level wrapper of the XmlHttpRequest object ( *qx.bom.Request* ) is **not** provided by default.

.. _pages/setup_a_low-level_library#ready_to_code:

Ready to code
=============

As already mentioned implementing your logic is a no-brainer. Just grab the existing ``index.html`` file and start right away.

.. code-block:: html

    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.2//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <script src="qx-bom.js" type="text/javascript" charset="utf-8"></script>
      <script type="text/javascript">
        // get informed about startup
        qx.event.Registration.addListener(window, "ready", onReady);

        function onReady(e)
        {
            <!-- your application code resides here -->
        }
      </script>
    </head>
    <body>
      <!-- more HTML -->
    </body>
    </html>

