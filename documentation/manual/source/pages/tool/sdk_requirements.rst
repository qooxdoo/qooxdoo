.. _pages/tool/requirements#requirements:

SDK Requirements
****************

%{qooxdoo} offers a platform-independent and user-friendly tool chain, in form of an SDK. It comes with the :doc:`/pages/desktop` and :doc:`/pages/mobile` downloads. For those components you use it for *creating and developing* a %{qooxdoo} application. It is not needed for *running* the application. For the :doc:`/pages/website` and :doc:`/pages/server` components there are pre-build libraries to download, so you don't need the SDK.


.. _pages/tool/requirements#python:

Python
======
The tool chain only requires a `Python <http://www.python.org>`_ installation. Use a standard **Python 2.x** release, version 2.5 or above. Python 3 is currently `not supported <http://%{qooxdoo}.org/docs/general/python_3_support>`_. (If in doubt you can query the version of your local Python installation by running the command ``python -V``). As a %{qooxdoo} user you do not need any Python knowledge, it is merely a technology used internally for the tools. Python comes either pre-installed on many systems or it can be installed very easily:


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

.. _pages/tool/requirements#disk_space:

Disk Space
==========

The unpacked SDK will require around **%{sdk_unpacked} MB** disk space (a big part of this is due to media files like images).

During runtime the tool chain also uses a subdirectory in your system's ``TMP`` path, to cache intermediate results and downloaded files. Depending on your activities this cache directory can become between **%{cache_average_min}** and **%{cache_average_max} GB** in size. If the `default cache path <http://%{qooxdoo}.org/docs/general/snippets#finding_your_system-wide_tmp_directory>`__ does not suite you, you can change it in your configuration.

.. _pages/tool/requirements#setup:

Installation and Setup
======================

Installation of the SDK is just going to the `download section <http://%{qooxdoo}.org/downloads>`_ and grab the package suitable for your purpose. Choose either the *Desktop* or *Mobile* download, which both come as an SDK archive. Unzip it to a suitable path on your hard disk. The archive contains a single top-level folder, which in turn contains all the SDK's files and sub-folders. 

This is all as far as the SDK is concerned. As an additional convenience you might want to add the ``<sdk-root-path>/tool/bin`` directory to your system environment ``PATH`` variable. This is a prerequisite for invoking the executable programs of the tool chain without the need to address them with their path.

Installation Troubleshooting
==============================

.. toctree::
   :maxdepth: 1

   sdk_install_troubleshoot
