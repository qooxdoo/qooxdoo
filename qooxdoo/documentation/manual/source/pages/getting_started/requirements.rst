.. _pages/requirements#requirements:

Requirements
************

Here are the requirements for developing and deploying a qooxdoo application. A typical qooxdoo application is a JavaScript-based "fat-client" that runs in a web browser. It does not enforce any specific backend components, any HTTP-aware server should be fine. The framework comes with a powerful tool chain, that helps both in developing and deploying applications.

It is very straightforward to satisfy the requirements for those three topics (client, server, tools).

.. _pages/requirements#client:

Client
======

A qooxdoo application runs in all major web browsers - with identical look & feel:

.. list-table::

   * - .. image:: ie.png 
     - Internet Explorer 6+
   * - .. image:: ff.png 
     - Firefox 2+
   * - .. image:: opera.png 
     - Opera 9+
   * - .. image:: safari.png 
     - Safari 3+
   * - .. image:: chrome.png 
     - Chrome 2+

Not only the *end users* of your application benefit from this true cross-browser solution. As a developer you can also pick *your* preferred development platform, i.e. combination of browser and operating system. Most built-in developer :ref:`pages/requirements#tools` (e.g. for debugging, profiling) work cross-browser as well.

.. _pages/requirements#server:

Server
======

Developing a qooxdoo application does not require a server. Its static application contents (initial html file, JavaScript files, images, etc.) may just be loaded from your local file system.

Of course, for the actual deployment of your final app you would use a web server to deliver the (static) contents. For developing a qooxdoo app it is not a prerequisite to setup a web server, so you can start right away on your local computer. 

Any practical qooxdoo client application will communicate with a server, for instance to retrieve and store certain application data, to do credit card validation and so on. qooxdoo includes an advanced :doc:`RPC mechanism </pages/communication/rpc>` for direct calls to server-side methods. It allows you to write true client/server applications without having to worry about the communication details. qooxdoo offers such *optional* `RPC backends <http://qooxdoo.org/contrib/project#backend>`_ for Java, PHP, Perl and Python. If you are missing your favorite backend language, you can even create your own RPC server by following a generic :doc:`server writer guide </pages/communication/rpc_server_writer_guide>`.

If you already have an existing backend that serves HTTP (or HTTPS) requests and you do not want to use those optional RPC implementations, that's fine. It should be easy to integrate your qooxdoo app with your existing backend using traditional AJAX calls.

.. _pages/requirements#tools:

Tools
=====

qooxdoo comes with a platform-independent and user-friendly tool chain. It is required for *creating and developing* a qooxdoo application. It is *not* needed for running an application.

The tool chain only requires to have `Python <http://www.python.org>`_ installed. Use a standard **Python 2.x** release, version 2.5 or above. **Python 3** is currently `not supported <http://qooxdoo.org/documentation/general/python_3_support>`_! As a qooxdoo user you do not need any Python knowledge, it is merely a technology used internally for the tools. Python comes either pre-installed on many systems or it can very easily be installed:


|image0| Windows
^^^^^^^^^^^^^^^^

.. |image0| image:: windows.png

It is trivial! Just `download and install <http://www.activestate.com/Products/activepython/>`_ the excellent **ActivePython** package. Its default settings of the installation wizard are fine, there is nothing to configure. 
(It is no longer recommended to use the Windows package from `Python.org <http://www.python.org/download/releases/2.6.1/>`_, as this requires additional manual :ref:`configuration <pages/troubleshooting#windows>`).

|image1| Cygwin
^^^^^^^^^^^^^^^

.. |image1| image:: cygwin.png

`Cygwin <http://www.cygwin.com/>`_ can be used as an optional free and powerful Unix-like environment for Windows. You won't need a native Python installation, just make sure to include Cygwin's **built-in** Python as an additional package when using Cygwin's `setup program <http://cygwin.com/setup.exe>`_.

|image2| Mac
^^^^^^^^^^^^

.. |image2| image:: macosx.png

Python is **pre-installed** on Max OS X. No additional software needs to be installed, but on older systems it might need an update.

|image3| Linux
^^^^^^^^^^^^^^

.. |image3| image:: linux.png

Python often comes **pre-installed** with your favorite distribution. If not, simply use your package manager to install Python.

