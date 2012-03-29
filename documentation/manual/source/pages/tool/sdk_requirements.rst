.. _pages/requirements#requirements:

Requirements
************

..
   tool/troubleshooting

Here are the requirements for developing and deploying a qooxdoo application. A qooxdoo application is a JavaScript-based piece of software that runs on one or more of the supported platforms. Platforms include various browsers and non-browser runtimes like Node.js and Rhino.

qooxdoo does not enforce any specific backend components, any server that is reachable through the platform-provided communication facilities should be fine. If you use the SDK you get a powerful tool chain that helps in developing and deploying applications.

Here is a detailed list of supported platforms for the various qooxdoo components.

.. _pages/requirements#client:

Desktop Browser
================

This section applies to you if you want to work with the :doc:`Website </pages/website/overview>` or :doc:`Desktop </pages/desktop/ui_overview>` components of qooxdoo. An application built with those components runs in all major web browsers - if you use qooxdoo's GUI widgets with identical look & feel:

.. list-table::

   * - .. image:: /_static/ie.png 
     - Internet Explorer 6+
   * - .. image:: /_static/ff.png 
     - Firefox 2+
   * - .. image:: /_static/opera.png 
     - Opera 9+
   * - .. image:: /_static/safari.png 
     - Safari 3+
   * - .. image:: /_static/chrome.png 
     - Chrome 2+

Not only the end users of your application benefit from this true cross-browser solution. As a developer you can also pick *your* preferred development platform, i.e. combination of browser and operating system. Developers  should note that with some browsers, such as Chrome and Firefox, there is a known issue loading reasonably complex qooxdoo applications (such as the API viewer or the demo browser) via the `file://` protocol. Either consult your browser's documentation (usually there is a command-line option to fix this), or use the HTTP protocol even while developing. In the latter case be sure to read and understand this `FAQ entry <http://qooxdoo.org/documentation/general/snippets#running_a_source_version_from_a_web_server>`__.


.. _pages/requirements#mobile:

Mobile Browser
==============

This section applies to you if you want to work with the :doc:`Mobile </pages/mobile/mobile_overview>` components of qooxdoo.

.. list-table::

   * - .. image:: /_static/ie.png 
     - Internet Explorer
   * - .. image:: /_static/ff.png 
     - Firefox
   * - .. image:: /_static/opera.png 
     - Opera
   * - .. image:: /_static/safari.png 
     - Safari
   * - .. image:: /_static/chrome.png 
     - Chrome


.. _pages/requirements#server:

Server
======

The qooxdoo :doc:`Server </pages/server/overview>` component supports Node.js and Rhino as non-browser environments. As these allow you to create server-side applications, we refer to them as *server* platforms. This doesn't stop you from creating simple console-based apps for them, test automation scripts, or console-based clients for custom network services, using the *Server* component.


.. _pages/requirements#tools:

SDK
=====

qooxdoo comes with a platform-independent and user-friendly tool chain. It comes with the :doc:`Desktop </pages/desktop/ui_overview>` and :doc:`Mobile </pages/mobile/mobile_overview>` downloads. For those components you use it for *creating and developing* a qooxdoo application. It is not needed for running the application. For the *Website* and *Server* components there are pre-build libraries to download, so you don't need the SDK.

The tool chain only requires to have `Python <http://www.python.org>`_ installed. Use a standard **Python 2.x** release, version 2.5 or above. Python 3 is currently `not supported <http://qooxdoo.org/documentation/general/python_3_support>`_. (If in doubt you can query the version of your local Python installation by running the command ``python -V``). As a qooxdoo user you do not need any Python knowledge, it is merely a technology used internally for the tools. Python comes either pre-installed on many systems or it can very easily be installed:


|image0| Windows
^^^^^^^^^^^^^^^^

.. |image0| image:: /_static/windows.png

It is trivial! Just download and install the excellent `ActivePython <http://www.activestate.com/activepython/downloads>`_ package. Its default settings of the installation wizard are fine, there is nothing to configure. You can as well use the Windows package from `Python.org <http://www.python.org/download/releases/2.6.1/>`_, but this might require additional manual :ref:`configuration <pages/troubleshooting#windows>`.

|image1| Cygwin
^^^^^^^^^^^^^^^

.. |image1| image:: /_static/cygwin.png

`Cygwin <http://www.cygwin.com/>`_ can be used as an optional free and powerful Unix-like environment for Windows. You won't need a native Python installation, just make sure to include Cygwin's **built-in** Python as an additional package when using Cygwin's `setup program <http://cygwin.com/setup.exe>`_.

|image2| Mac
^^^^^^^^^^^^

.. |image2| image:: /_static/macosx.png

Python is **pre-installed** on Max OS X. No additional software needs to be installed, but on older systems it might need an update.

|image3| Linux
^^^^^^^^^^^^^^

.. |image3| image:: /_static/linux.png

Python often comes **pre-installed** with your favorite distribution, just make sure they're still using a Python 2.x version. If not, simply use your package manager to install a suitable package.

.. _pages/getting_started/setup#setup:

Installation and Setup
***********************

Installation of qooxdoo components is easy. First, go to the `download section <http://qooxdoo.org/download>`_ and grab a suitable package for your purpose. It is either just downloading a library file and placing it in a URL-addressable path in your development environment. Or, in the case of the SDK, download the SDK and unzip it to a suitable path on your hard disk. For further information please refer to specific sections of the qooxdoo component you want to work with. There, you will also find simple, introductory examples that show you how to get started working with the component.


Disk Space
==========

Disk requirements will vary largely depending on the component you chose, with the library files usually small in footprint. The unpacked SDK will require around **%{sdk_unpacked} MB** disk space (most of this is due to media files, like images).

The tool chain also uses a directory in your system's TMP path, to cache intermediate results and downloaded files. Depending on your activities this cache directory can become between **%{cache_average_min}** and **%{cache_average_max} GB** in size. If the `default cache path <http://qooxdoo.org/documentation/general/snippets#finding_your_system-wide_tmp_directory>`__ does not suite you, you can change it in your configuration.
