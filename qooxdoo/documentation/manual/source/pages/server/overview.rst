.. _pages/server/overview:

Server Overview
***************

This page is an overview of qooxdoo's server capabilities. It shows which parts of qooxdoo can be used in a server environment or comparable scenario. It also serves as an introduction to all interessted in using qooxdoo on a %{JS} server environment.


.. _pages/server/overview#how_to_get_it:

How to get it?
==============
There are three ways of working with qooxdoo in a server environment. 

Download
--------
The first and easiest way is to simply `download <http://demo.qooxdoo.org/devel/>`_ the *qxoo* package either in the `optimized <http://demo.qooxdoo.org/devel/framework/qx-oo.js>`_ or `unoptimized <http://demo.qooxdoo.org/devel/framework/qx-oo-noopt.js>`_ version.


npm
---
`npm <http://npmjs.org/>`_ is the ``node package manager`` and therefore a comfortable and convinient way to install qooxdoo if you are working with node.js:

::

  npm install qooxdoo

This will install the qooxdoo package (which carries the same content as the *qxoo* archive) into your current folder from where you can include it easily into your application. More details how to use it in the `Basic Example`_.


Skeleton
--------
The `skeleton <../development/skeletons.html#basic>`_ is the way qooxdoo apps are usually build. This offers the support of the :doc:`toolchain </pages/tool>` which includes a lot of handy features like dependency detection, optimization, API doc generation and so on.


.. _pages/server/overview#included_features:

Included Features
=================

This listing shows the core features of the *qxoo* package. If you build your own package with the skeleton way of using qooxdoo, the feature set might be extended depending on your application code.

* :doc:`Object Orientation </pages/core/oo_introduction>`
   * :doc:`Classes </pages/core/classes>`
   * :doc:`Mixins </pages/core/mixins>`
   * :doc:`Interfaces </pages/core/interfaces>`
   * :doc:`Properties </pages/core/understanding_properties>`
* :doc:`Events </pages/low_level/event_layer_impl>`
* :doc:`Single Value Binding </pages/data_binding/single_value_binding>`

Most of the features can be found in qooxdoo's core layer and should be familiar to qooxdoo developers.

.. _pages/server/overview#supported_runtimes:

Supported Runtimes
==================

We currently support two types of runtimes:

* `node.js <http://nodejs.org/>`_
* `Rhino <http://www.mozilla.org/rhino/>`_

.. _pages/server/overview#basic_example:

Basic Example
=============
The following example shows how to use the *qxoo* package in a node environment having the package installed via npm.

::

  var qx = require('qooxdoo');

  // create anmial class
  qx.Class.define("my.Animal", {
    extend : qx.core.Object,
    properties : {
      legs : {init: 4}
    }
  });

  // create dog class
  qx.Class.define("my.Dog", {
    extend : my.Animal,
    members : {
      bark : function() {
        console.log("WAU! I have " + this.getLegs() + " legs!");
      }
    }
  });

  var dog = new my.Dog();
  dog.bark();


The only line which is specific to the server environment is the first one, where you include the qooxdoo package. The rest of the code is plain qooxdoo %{JS} which can be run in a browser, too. For more on that take a look at the documentation about :doc:`Object Orientation </pages/core/oo_introduction>`.


.. _pages/server/overview#additional_scenarios:

Additional Scenarios
====================

The *qxoo* package does not have any server dependend code in it so it can also be used in a browser e.g. to have the features described above without the need to use the rest of qooxdoo. Another interessting scenario might be to use the package in a `web worker <https://developer.mozilla.org/en/Using_web_workers>`_ which is also a DOM-less environment.
