
.. _/home/thron7/workspace/qooxdoo.trunk/documentation/manual/source/pages/communication/rpc_overview#calling_remote_procedures_with_qooxdoo:

Calling Remote Procedures with qooxdoo
**************************************

qooxdoo contains a standard way to make remote procedure calls, using the `JSON-RPC protocol <http://json-rpc.org/wiki/specification>`_. There is an alternative `SOAP client/server implementation <http://qooxdoo.org/contrib/project#soap>`_. We'll cover only the JSON-RPC mechanism here.

.. _/home/thron7/workspace/qooxdoo.trunk/documentation/manual/source/pages/communication/rpc_overview#json-rpc_protocol:

JSON-RPC Protocol
=================

According to Wikipedia, `JSON-RPC <http://en.wikipedia.org/wiki/JSON-RPC>`_ "is a very simple protocol (and very similar to XML-RPC), defining only a handful of data types and commands. In contrast to XML-RPC or SOAP, it allows for bidirectional communication between the service and the client, treating each more like peers and allowing peers to call one another or send notifications to one another. It also allows multiple calls to be sent to a peer which may be answered out of order." The current servers do not yet support bi-directional communication, but this could be something to be implemented in the future, using `cometd <http://qooxdoo.org/contrib/project#cometd>`_ technology.

.. _/home/thron7/workspace/qooxdoo.trunk/documentation/manual/source/pages/communication/rpc_overview#making_json-rpc_calls_from_qooxdoo:

Making JSON-RPC calls from qooxdoo
==================================

Using the json-rpc transport is easy. See this `detailed tutorial <http://qooxdoo.org/documentation/0.8/rpc>`_ with code examples. 

.. _/home/thron7/workspace/qooxdoo.trunk/documentation/manual/source/pages/communication/rpc_overview#json-rpc_backends:

JSON-RPC Backends
=================

qooxdoo comes with a choice of backends in different languages:

  * **:doc:`Java <0.8/rpc_java>`**
  * **:doc:`PHP <0.8/rpc_php>`**
  * **:doc:`Perl <0.8/rpc_perl>`**
  * **:doc:`Python <rpc_python>`**

.. _/home/thron7/workspace/qooxdoo.trunk/documentation/manual/source/pages/communication/rpc_overview#qooxdoo_json-rpc_specifications:

qooxdoo JSON-RPC Specifications
===============================

In order to qualify as a qooxdoo json-rpc backend, a server must comply with the :doc:`qooxdoo json-rpc server specifications <jsonrpc_server_specs>`. 

.. _/home/thron7/workspace/qooxdoo.trunk/documentation/manual/source/pages/communication/rpc_overview#adding_to_the_standard:

Adding to the standard
----------------------

If you think that the standard is missing a feature that should be implemented in all backends, please add it as a `bug <http://bugzilla.qooxdoo.org/enter_bug.cgi?product=contrib&component=RpcExample>`_, marking it as a "core feature request". 

.. _/home/thron7/workspace/qooxdoo.trunk/documentation/manual/source/pages/communication/rpc_overview#extending_the_standard:

Extending the standard
----------------------

If a server *extends* the standard with a certain optional behavior, please add a detailed description to it on the :doc:`JSON-RPC Extensions page <jsonrpc_extensions>`, with information which server implements this behavior. please also add a `bug <http://bugzilla.qooxdoo.org/enter_bug.cgi?product=contrib&component=RpcExample>`_, marked as a "extension" so that other server maintainers can discuss the pros and cons of adding the extension to their own servers. 

.. _/home/thron7/workspace/qooxdoo.trunk/documentation/manual/source/pages/communication/rpc_overview#debugging_backends:

Debugging Backends
==================

In order to debug your service methods on the backend independently of the client application, use the `RpcConsole <http://qooxdoo.org/contrib/project#rpcconsole>`_ contribution (`documentation <http://qooxdoo.org/contrib/project/rpcconsole>`_).

.. _/home/thron7/workspace/qooxdoo.trunk/documentation/manual/source/pages/communication/rpc_overview#creating_mockup_data:

Creating mockup data
====================

The RpcConsole also contains a mixin class for qx.io.remote.Rpc which allows to prepare code relying on a json-rpc backend to work with static mockup data independently of the server. This allows to develop client and server independently and to create static demos. For more information, see the corresponding `documentation <http://qooxdoo.org/contrib/project/rpcconsole#creating_mockup_data>`_.


