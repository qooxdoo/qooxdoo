Requirements
************

Here are the requirements for developing and deploying a qooxdoo application. A typical qooxdoo application is a JavaScript-based "fat-client" that runs in a web browser. It does not enforce any specific backend components, any HTTP-aware server should be fine. The framework comes with a powerful tool chain, that helps both in developing and deploying applications.

It is very straightforward to satisfy the requirements for those three topics (client, server, tools).

Client
======

A qooxdoo application runs in all major web browsers - with identical look & feel:\\
\\
:documentation:ie.png?22x22&nolink|:documentation:ie.png  Internet Explorer 6+\\
:documentation:ff.png?22x22&nolink|:documentation:ff.png  Firefox 2+\\
:documentation:opera.png?22x22&nolink|:documentation:opera.png  Opera 9+\\
:documentation:safari.png?22x22&nolink|:documentation:safari.png  Safari 3+\\
:documentation:chrome.png?22x22&nolink|:documentation:chrome.png  Chrome 2+\\

Not only the *end users* of your application benefit from this true cross-browser solution. As a developer you can also pick *your* preferred development platform, i.e. combination of browser and operating system. Most built-in developer <#tools> (e.g. for debugging, profiling) work cross-browser as well.

Server
======

Developing a qooxdoo application does not require a server. Its static application contents (initial html file, JavaScript files, images, etc.) may just be loaded from your local file system.

Of course, for the actual deployment of your final app you would use a web server to deliver the (static) contents. For developing a qooxdoo app it is not a prerequisite to setup a web server, so you can start right away on your local computer. 

Any practical qooxdoo client application will communicate with a server, for instance to retrieve and store certain application data, to do credit card validation and so on. qooxdoo includes an advanced <RPC|RPC mechanism> for direct calls to server-side methods. It allows you to write true client/server applications without having to worry about the communication details. qooxdoo offers such *optional* <:contrib:project#backend|RPC backends> for Java, PHP, Perl and Python. If you are missing your favorite backend language, you can even create your own RPC server by following a generic :doc:`server writer guide <pages/rpc_server_writer_guide>`.

If you already have an existing backend that serves HTTP (or HTTPS) requests and you do not want to use those optional RPC implementations, that's fine. It should be easy to integrate your qooxdoo app with your existing backend using traditional AJAX calls.

Tools
=====

qooxdoo comes with a platform-independent and user-friendly tool chain. It is required for *creating and developing* a qooxdoo application. It is *not* needed for running an application.

The tool chain only requires to have `Python <http://www.python.org>`_ installed. Use a standard **Python 2.x** release, version 2.5 or above. **Python 3** is currently **<documentation:python_3_support|not supported>**! As a qooxdoo user you do not need any Python knowledge, it is merely a technology used internally for the tools. Python comes either pre-installed on many systems or it can very easily be installed:

<html>
<!--
^ When using ... ^ ... do the following: ^
| documentation:windows.png?22x22&nolink Windows |  `install ActivePython <http://www.activestate.com/Products/activepython/>`_|
| documentation:cygwin.png?22x22&nolink Cygwin | <|use package manager>|
| documentation:macosx.png?20x20&nolink Mac | nothing to be done |
| documentation:linux.png?22x22&nolink Linux | use package manager |
-->
</html>

|image0| Windows
^^^^^^^^^^^^^^^^

.. |image0| image:: http://qooxdoo.org/_media/documentation/windows.png?w=22&h=22&cache=cache

It is trivial! Just `download and install <http://www.activestate.com/Products/activepython/>`_ the excellent **ActivePython** package. Its default settings of the installation wizard are fine, there is nothing to configure. 
*(It is no longer recommended to use the Windows package from [[http:*www.python.org/download/releases/2.6.1/|Python.org]], as this requires additional manual <troubleshooting#windows|configuration>).//

|image0| Cygwin
^^^^^^^^^^^^^^^

.. |image0| image:: http://qooxdoo.org/_media/documentation/cygwin.png?w=22&h=22&cache=cache

`Cygwin <http://www.cygwin.com/>`_ can be used as an optional free and powerful Unix-like environment for Windows. You won't need a native Python installation, just make sure to include Cygwin's **built-in** Python as an additional package when using Cygwin's `setup program <http://cygwin.com/setup.exe>`_.

|image0| Mac
^^^^^^^^^^^^

.. |image0| image:: http://qooxdoo.org/_media/documentation/macosx.png?w=20&h=20&cache=cache

Python is **pre-installed** on Max OS X. No additional software needs to be installed, but on older systems it might need an update.

|image0| Linux
^^^^^^^^^^^^^^

.. |image0| image:: http://qooxdoo.org/_media/documentation/linux.png?w=22&h=22&cache=cache

Python often comes **pre-installed** with your favorite distribution. If not, simply use your package manager to install Python.

