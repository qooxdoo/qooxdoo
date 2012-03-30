.. _pages/server/requirements#requirements:

%{Server} Requirements
***********************

%{qooxdoo} %{Server} is a basic component that runs in many different contexts and environments, as it has very little dependencies to the underlying runtime. For use in command-line tools and programs you will need a corresponding %{JS} interpreter like Node.js or Mozilla Rhino. For use in HTML5 Webworkers you will need a browser that supports this.

.. _pages/server/requirements#runtimes:

Runtimes
==============

The following runtimes are supported:

* `Node.js <http://nodejs.org/>`_
* `Rhino <http://www.mozilla.org/rhino/>`_


.. _pages/server/requirements#installation:

Installation
=======================

These are the options to get hold of %{qooxdoo} %{Server}.

Manual download
---------------
Download the %{Server} component from %{qooxdoo}'s `download page <http://%{qooxdoo}.org/download>`_ and place it in a suitable path on your machine. There is an optimized and an unoptimized version available.

Npm
-------
If you are using Node.js, there is an alternative installation using `npm <http://npmjs.org/>`_, the Node package manager. If you have this installed, issue on your system shell:

.. code-block:: bash

   $ npm install qooxdoo

This will install the %{qooxdoo} package into your current folder from where you can include it easily into your applications.

In both cases, to verify the installation use your runtime's loading primitive to include it in a program, e.g. for Node::

    var qx = require('%{qooxdoo}')

SDK
----
You can also use the :doc:`SDK </pages/tool/sdk_introduction>` to work with %{Server}. It provides a dedicated :ref:`skeleton <pages/development/skeletons#basic>` which you can utilize. This offers you additional features like dependency detection, optimization, API doc generation, and generated loaders that work under both Node.js and Rhino.


