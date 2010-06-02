.. _pages/rpc_php#php_rpc:

PHP RPC
*******

*qooxdoo includes an advanced RPC mechanism for direct calls to server-side methods. It allows you to write true client/server applications without having to worry about the communication details.* 

As described in the :doc:`RPC overview <rpc>`, qooxdoo RPC is based on `JSON-RPC <http://json-rpc.org/>`_ as the serialization and method call protocol. This page describes how to set up and implement a PHP-based server.

.. _pages/rpc_php#setup:

Setup
=====

.. note::

    The following information is from the `README.CONFIGURE <http://qooxdoo-contrib.svn.sourceforge.net/viewvc/qooxdoo-contrib/trunk/qooxdoo-contrib/RpcPhp/trunk/README.CONFIGURE?view=markup>`_ file of the `RpcPhp <http://qooxdoo.org/contrib/project#rpcphp>`_ contribution.

The simplest configuration of the PHP JSON-RPC server requires these steps:

* Copy the services directory to the root of your web server's data directory, e.g. ``/var/www``

* Ensure that PHP is properly configured.  Try placing a file in the services directory called ``test.php`` which contains this data:

  ::

    <?php
      phpinfo();
    ?>

  You should then be able to access ``http://your.domain.com/services/test.php`` and see the ``phpinfo()`` output.  If not, you have a web server / php configuration problem to work out.

* Configure your web server to load index.php if it's found in a directory specified by the URL.  By default, the web server probably looks only for ``index.html`` and ``index.htm``, but you want it also to look for ``index.php``.

.. _pages/rpc_php#example:

Example
=======

Please see `RpcExample <http://qooxdoo.org/contrib/project#rpcexample>`_ for an example of how to use an RPC backend.

To set up the RPC Example application:

#. Change directory into qooxdoo-contrib/trunk/RpcExample

#. Edit config.json such that the "path" inside of the "include" key properly points to the framework's application.json file, and the QOOXDOO_PATH variable inside of the "let" key properly points to the root of the framework source tree.

#. Type "generate.py build". That will create a "build" qooxdoo-contrib/trunk/RpcExample/build directory

#. Copy the contents of the build directory to the web server root directory called "test", so your root contains 'test' and 'services'. If you're on Linux, the best way is with rsync:

  .. code-block:: bash

    # mkdir /var/www/test
    # rsync -av ./build/ /var/www/test/

Note the slash after 'build' so that it copies the **contents** of 'build' into 'test', but not the directory 'build' itself.

#. Browse to ``http://your.domain.com/test/index.html`` and ensure that the echo test in the first tab runs, and then try the Rpc Server Functionality (async) test in the fourth tab.

