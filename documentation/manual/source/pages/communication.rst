Communication
*************

Sending HTTP requests and receiving responses is an important feature of almost every application running in the browser. Most commonly, the technique used is termed Ajax. qooxdoo’s communication stack offers many ways to facilitate HTTP communication at different levels of abstraction.

.. _pages/communication#low_level_requests:

Low-level requests
==================

At the very core, HTTP requests from the browser are made by interfacing with the HTTP client API or by adding a script tag to the document. Classes dealing with those low-level transport methods can be found in the ``qx.bom.request`` namespace. Usually they are not instantiated directly by the user.

``Xhr`` is a wrapper of the HTTP client API offered by the browser. It’s purpose is to hide inconsistencies and to work around bugs found in popular implementations. The interface of ``qx.bom.request.Xhr`` is similar to `XMLHttpRequest <http://www.w3.org/TR/XMLHttpRequest2/>`_, the HTTP client API specified by the W3C.

``Script`` is a script loader. Internally, the class deals with adding and removing script tags to the document and keeping track of the load status. Just like ``qx.bom.request.Xhr``, the interface is modeled based on XMLHttpRequest.

``Jsonp`` builds on the script loader and adds functionality needed to receive JSONP responses. JSONP stands for JSON with padding and is a technique to safely receive remote data. It's main advantage compared to to ``Xhr`` is that cross-origin requests are supported in all browsers.

Higher-level requests
=====================

Classes found in ``qx.io.request`` build on the groundwork laid by ``qx.bom.request``. Properties allow to conveniently setup a request and fine-grained events facilitate handling changes of the request's status or response.

.. toctree::

  communication/request_io

Note that historically, qooxdoo comes with two transport layers. The old transport layer is described below.

.. toctree::

   communication/remote_io


REST
=============

``qx.io.rest.Resource`` is a client-side wrapper of a REST resource.

.. toctree::

  communication/rest

Remote Procedure Calls (RPC)
=========================================

.. toctree::

   communication/rpc

RPC Servers
-----------

.. toctree::

   communication/rpc_server_writer_guide

Specific Widget Communication
=============================

.. toctree::

   widget/table_remote_model

