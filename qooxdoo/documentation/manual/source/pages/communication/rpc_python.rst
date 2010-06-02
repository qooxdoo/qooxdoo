.. _pages/rpc_python#rpc_with_a_python_server:

RPC with a Python server
************************

*qooxdoo includes an advanced RPC mechanism for direct calls to server-side methods. It allows you to write true client/server applications without having to worry about the communication details.**

As described in the :doc:`RPC overview <rpc>`, qooxdoo RPC is based on `JSON-RPC <http://json-rpc.org/>`_ as the serialization and method call protocol. This page describes how to set up and implement a Python-based server.

.. _pages/rpc_python#setup:

Setup
=====

Python 2.4 or 2.5 is required to run a JSON-RPC server. Download and install python from `python.org <http://python.org>`_ if you don't have it.

The JSON-RPC backend itself is based on the `qxjsonrpc <http://python.cx.hu/qxjsonrpc>`_ library. Download the qxjsonrpc package from `here <http://python.cx.hu/qxjsonrpc/#download>`_, extract the archive and run python setup.py install as usual. This will install the qxjsonrpc package into the site-packages subdirectory of your python installation.

The backend requires `python-cjson <http://python.cx.hu/python-cjson>`_ or `simplejson <http://cheeseshop.python.org/pypi/simplejson>`_ for JSON serialization. Install at least one of them. Building python-cjson requires a C compiler, but it is much faster (10-100x) than the pure python simplejson package.

A backend based on qxjsonrpc can be run as

* a standalone HTTP server using the qxjsonrpc.http.HTTPServer class or
* a WSGI application using the qxjsonrpc.wsgi.WSGIApplication class.

You can find examples in the downloaded qxjsonrpc archive.

**NOTE:** The qxjsonrpc package is very young, it should not be used in production. Bug reports are always welcome. Send your reports to `Viktor Ferenczi <python@cx.hu?subject=qooxdoo%20wiki>`__. Thank you in advance.

.. _pages/rpc_python#writing_your_own_services:

Writing your own services
=========================

Let's start by writing our own first service which will add its arguments up. The service will be called example.wiki and have a method called add.

To do this, we create a service class called ExampleWikiService which will live in a file wiki.py. This file can be created anywhere with the following contents, preserving the indentation of the source code:

.. code-block:: python

  #!/usr/bin/python
  # -*- coding: ascii -*-

  import qxjsonrpc
  import qxjsonrpc.http

  class ExampleWikiService(object):
      def __init__(self):
          self.total=0
      @qxjsonrpc.public
      def add(self, *args):
          for value in args:
              self.total+=value
          return self.total

  def main():
      server=qxjsonrpc.http.HTTPServer()
      server.setService('example.wiki', ExampleWikiService())
      server.serve_forever()

  if __name__=='__main__': main()
  
.. quiet vim parser*

Note the ``@qxjsonrpc.public`` decorator in the service class. The public decorator makes the decorated method accessible to everyone. Undecorated methods are not accessible by RPC clients.

The service is just an executable Python script. Running ``wiki.py`` will run a JSON-RPC server at localhost:8000 by default. Open the following link in a new browser window or tab:

http://localhost:8000/?id=1&service=example.wiki&method=add&params=[2]

It should show you the JSON-RPC response. The result will be the accumulated total value. Pressing the refresh (``F5``) key will increment the total value by two as passed in the only argument in the params array.

The RPC call was actually made using the HTTP GET method. You can achieve the same result by sending the same request arguments using the HTTP POST or the ScriptTransport protocol. The later is used by the qooxdoo library for cross-domain requests. Use qooxdoo's RPC functionality for best results.

You can change the arguments to be passed to the method by altering the params array in the address bar. Multiple numbers or even floating point values can be added. If you does not add params at all the total won't change.

.. _pages/rpc_python#a_more_advanced_example:

A more advanced example
=======================

To be done.

.. _pages/rpc_python#using_sessions:

Using sessions
==============

@qxjsonrpc.session

To be done.

.. _pages/rpc_python#running_as_part_of_a_web_server:

Running as part of a WEB server
===============================

* WSGI: Apache 2.0 and mod_wsgi

To be done.
