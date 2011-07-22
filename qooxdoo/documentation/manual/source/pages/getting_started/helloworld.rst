.. _pages/getting_started/helloworld#hello_world:

Hello World
***********

This tutorial is a step-by-step instruction on how to get started with qooxdoo by creating your very first application.

.. _pages/getting_started/helloworld#setup_the_framework:

Setup the Framework
===================

.. _pages/getting_started/helloworld#requirements:

Requirements
^^^^^^^^^^^^

Please make sure to have read the detailed :doc:`requirements`. To recap, there are only a few requirements for full-featured qooxdoo application development:

* *client*: any major web browser
* *server*: any HTTP-aware backend. During development the local file system should also be ok (*)
* *operating system*: any
* *tools*: Python required

(*) Developers using Chrome should note that there is a known issue loading reasonably complex qooxdoo applications (such as the API viewer or the demo browser) via the file:// protocol. It is recommended to Chrome users to use the HTTP protocol, even while developing.

.. _pages/getting_started/helloworld#download:

Download
^^^^^^^^

Go to the `Download <http://qooxdoo.org/download>`_ section and grab the latest stable Software Development Kit (SDK).

.. _pages/getting_started/helloworld#installation:

Installation
^^^^^^^^^^^^

Unzip the SDK archive.

Disk Space
^^^^^^^^^^^

The unpacked SDK will require around **%{sdk_unpacked} MB** disk space (most of this is due to media files, like images).

The tool chain also uses a directory in your system's TMP path, to cache intermediate results and downloaded files. Depending on your activities this cache directory can become between **%{cache_average_min}** and **%{cache_average_max} GB** in size. If the `default cache path <http://qooxdoo.org/documentation/general/snippets#finding_your_system-wide_tmp_directory>`__ does not suite you, you can change it in your configuration.



.. _pages/getting_started/helloworld#create_your_application:

Create your Application
=======================

It is easy to setup your own application using the platform-independent script ``create-application.py``. It will create a skeleton application in a directory you specify, that is automatically configured to work with your version of the qooxdoo framework.

To create a new skeleton with ``create-application.py`` you will need to follow some initial *platform-dependent* steps - even when the rest of your development is independent of the platform. Please see the appropriate section below for :ref:`pages/getting_started/helloworld#windows`, :ref:`pages/getting_started/helloworld#cygwin` or :ref:`pages/getting_started/helloworld#mac_linux`

.. note::

    If you have any problems setting up the qooxdoo tool chain, please see some additional help for :doc:`troubleshooting <troubleshooting>`.


.. _pages/getting_started/helloworld#windows:

Windows |image0|
^^^^^^^^^^^^^^^^

.. |image0| image:: windows.png

Installing `ActivePython <http://www.activestate.com/Products/activepython/index.mhtml>`_ for Windows is trivial. Now let's create an application named ``custom`` in ``C:``, with the qooxdoo SDK available at ``C:\qooxdoo-%{version}-sdk``: 

::

    C:\qooxdoo-%{version}-sdk\tool\bin\create-application.py --name=custom --out=C:

.. _pages/getting_started/helloworld#cygwin:

Cygwin |image1|
^^^^^^^^^^^^^^^

.. |image1| image:: cygwin.png

To create your application ``custom`` to ``C:``, with the qooxdoo SDK available at ``C:\qooxdoo-%{version}-sdk``, call the script as follows:

::

    /cygdrive/c/qooxdoo-%{version}-sdk/tool/bin/create-application.py --name=custom --out=C:

.. _pages/getting_started/helloworld#mac_linux:

Mac |image2| , Linux |image3|
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. |image2| image:: macosx.png
.. |image3| image:: linux.png

To create an application ``custom`` in your home directory, change to your home directory (just ``cd``). With a qooxdoo SDK available at ``/opt/qooxdoo-%{version}-sdk``, call the script as follows:

::

    /opt/qooxdoo-%{version}-sdk/tool/bin/create-application.py --name=custom --out=.

.. _pages/getting_started/helloworld#run_your_application:

Run your Application
====================

Now that your application is setup, lets generate a version that can be opened in your browser. Move to the newly created application directory and kick off the automatic build process:

::

    cd C:/custom
    generate.py source-all

Under non-Windows systems you might have to prefix the command with the local directory, i.e. execute ``./generate.py source-all`` instead.

Please note, that the additional ``source-all`` target was introduced with qooxdoo 0.8.1. The regular ``source`` target now only includes those qooxdoo :term:`classes <Class>` that are actually required by your app, not all the source classes.

After the application has been generated, open ``source/index.html`` file in your web browser to run your application and click the button:

|Running application|

.. |Running application| image:: running_application.png
                         :width: 500 px
                         :target: ../../_images/running_application.png

.. _pages/getting_started/helloworld#write_application_code:

Write Application Code
======================

The folder ``source/class`` contains all your application classes. When starting with a newly created application, there is only a single file ``custom/Application.js``. Open it in your favorite editor or IDE. 

The method ``main()`` contains the entire code of your little skeleton app. Even if you haven't done any qooxdoo programming before, you should be able to figure out what the code does. Get familiar with the code and change it, e.g. modify the label of the button, move the button to another position or add a second button.

To see the changes, you just have to refresh your document in the browser, e.g. by hitting ``F5``. During development there usually is no need to re-generate this so-called "source" version of your app. Only if you later introduce new classes or if dependencies between classes change, you would have to regenerate your app. To do so, execute ``generate.py source-all`` (to include all source classes) or ``generate.py source`` (to only include the required classes) before refreshing your browser.

.. _pages/getting_started/helloworld#debugging:

Debugging
=========

In your newly created application you have certainly noticed the following code:

::

    if (qx.core.Environment.get("qx.debug"))
    {
      qx.log.appender.Native;
      qx.log.appender.Console;
    }

This code turns on two different ways of "logging", i.e. capturing and printing out information about the operation of your application. 

``qx.log.appender.Native`` uses the native logging capabilities of your client if available, e.g. `Firebug <http://getfirebug.com>`_ in Firefox (use ``F12`` to toggle). If your browser doesn't come with developer-friendly logging, ``qx.log.appender.Console`` provides such a feature for *all* browsers: the console prints out the log messages in an area inside your browser window. It also includes an interactive JavaScript shell (use ``F7`` to toggle):

|Debug application|

.. |Debug application| image:: debug_application.png
                       :width: 500 px
                       :target: ../../_images/debug_application.png

The reason for enclosing the two logging classes in a so-called "debug" variant is explained in more detail in the next section. It ensures that logging is only turned on in the development version (i.e. "source" version) of your app. It will automatically be turned off in the final version of your app that is to be deployed:

.. _pages/getting_started/helloworld#deployment:

Deployment
==========

The development version of a qooxdoo app is called the "source" version, the deployment version of an app is called "build" version. It is easily generated by executing

::

    generate.py build

After successful completion let the browser open ``index.html`` from the newly created ``build`` folder. Although you probably won't see a difference between this deployment version of your app and the previous "source" version, it should have started up faster.

Unlike the "source" version, with its numerous unmodified JavaScript files, the "build" version only has to load a single, optimized JavaScript file.

Manually creating such a "custom build" from your application class (or classes) would have been a very tedious and complex job. In fact most other JavaScript libraries do provide built-in support to automate this task. Building your app strips off unneeded whitespaces and comments, optimizes and reorganizes your code, uses a JS linker to only include classes that your application needs, and many more refinements and optimizations as well.

A lot of debugging code is also removed when a "build" is generated, that would only be useful during development of your application, e.g. printing out informative warnings or coding hints. Just like the logging code in the section above, you can put arbitrary code into such "variants", which may then be automatically removed during "conditional compilation" of the build process. This lets you receive information on your app when you're developing it, but removes this for your final code, so your end users don't see it.

.. _pages/getting_started/helloworld#api_reference:

API Reference
=============

qooxdoo supports inline comments that are similar to Javadoc or JSDoc comments. They allow for JavaScript and qooxdoo specific features, and look like ``/** your comment */``. 

From those comments a complete, interactive API reference can be generated:

::

    generate.py api

To start the "API Viewer" application, open ``index.html`` from the newly created ``api`` folder in your browser. It includes fully cross-linked and searchable documentation of your application classes as well as the framework classes.

|API Viewer|

.. |API Viewer| image:: api_viewer.png
                :width: 500 px
                :target: ../../_images/api_viewer.png

.. _pages/getting_started/helloworld#unit_testing:

Unit Testing
============

You might have noticed the ``test/DemoTest.js`` file in the ``source/class`` folder of your application. This class demonstrates how to define "unit tests" for your application. qooxdoo comes with its own unit testing framework, it does not require any additional software installation. Simply execute the following command:

::

    generate.py test

Open ``index.html`` from the newly created top-level ``test`` folder in your browser. The "Testrunner" application allows you to select and run the tests under your application namespace:

|Testrunner application|

.. |Testrunner application| image:: /pages/_static/testrunner.png
                            :width: 500 px
                            :target: ../../_images/testrunner.png

You may skip the rather advanced topic of unit tests while continuing to extend your custom application code. In case you are interested in test-driven development and creating your own unit tests, please see the corresponding :doc:`Unit Testing </pages/development/unit_testing>` documentation.

