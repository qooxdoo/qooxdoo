.. _Requirements:

Requirements
============

Here are the requirements for developing and deploying a qooxdoo application. A typical qooxdoo application is a JavaScript-based "fat-client" that runs in a web browser. It does not enforce any specific backend components, any HTTP-aware server should be fine. The framework comes with a powerful tool chain, that helps both in developing and deploying applications.

It is very straightforward to satisfy the requirements for those three topics (client, server, tools).
 
   
Client
______

A qooxdoo application runs in all major web browsers - with identical look&feel:

.. list-table::

   * - .. image:: /icons/ie.png 
     - Internet Explorer 6+
   * - .. image:: /icons/ff.png 
     - Firefox 2+
   * - .. image:: /icons/opera.png 
     - Opera 9+
   * - .. image:: /icons/safari.png 
     - Safari 3+
   * - .. image:: /icons/chrome.png 
     - Chrome 2+
 
  
  
  
  

Not only the end users of your application benefit from this true cross-browser solution. As a developer you can also pick your preferred development platform, i.e. combination of browser and operating system. Most built-in developer tools (e.g. for debugging, profiling) work cross-browser as well.


Server
------

Developing a qooxdoo application does not require a server. Its static application contents (initial html file, JavaScript files, images, etc.) may just be loaded from your local file system.

Of course, for the actual deployment of your final app you would use a web server to deliver the (static) contents. For developing a qooxdoo app it is not a prerequisite to setup a web server, so you can start right away on your local computer. 

Any practical qooxdoo client application will communicate with a server, for instance to retrieve and store certain application data, to do credit card validation and so on. qooxdoo includes an advanced :ref:`RPC mechanism <RPC>` for direct calls to server-side methods. It allows you to write true client/server applications without having to worry about the communication details. qooxdoo offers such *optional* `RPC backends <http://qooxdoo.org/contrib/project#backend>`_ for Java, PHP, Perl and Python. If you are missing your favorite backend language, you can even create your own RPC server by following a generic :ref:`server writer guide <server_writer_guide>`.

If you already have an existing backend that serves HTTP (or HTTPS) requests and you do not want to use those optional RPC implementations, that's fine. It should be easy to integrate your qooxdoo app with your existing backend using traditional AJAX calls.


Tools
-----

qooxdoo comes with a platform-independent and user-friendly tool chain. It is required for *creating and developing* a qooxdoo application. It is *not* needed for running an application.

The tool chain only requires to have Python_ installed. Use a standard **Python 2.x** release, version 2.4 and above. **Python 3** is currently :ref:`not supported! <python_3_support>`. As a qooxdoo user you do not need any Python knowledge, it is merely a technology used internally for the tools. Python comes either pre-installed on many systems or it can very easily be installed:


Windows
_______

It is trivial! Just download and install the excellent ActivePython_ package. Its default settings of the installation wizard are fine, there is nothing to configure. 


Cygwin
______

Cygwin_ is a free and powerful Unix-like environment for Windows. You won't need a native Python installation, just make sure to include Cygwin's **built-in**  Python as an additional package when using `Cygwin's setup program`_.
Remember: Cygwin is no longer required for qooxdoo 0.8 and above.


Mac
___

Python is **pre-installed** on Max OS X. No additional software needs to be installed, but on older systems it might need an update.


Linux
_____

Python often comes **pre-installed** with your favorite distribution. If not, simply use your package manager to install Python.


.. _Python: http://www.python.org/
.. _ActivePython: http://www.activestate.com/Products/activepython/
.. _Cygwin: http://www.cygwin.com/ 
.. _Cygwin's setup program: http://cygwin.com/setup.exe