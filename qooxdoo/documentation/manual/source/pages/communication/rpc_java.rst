.. _pages/rpc_java#java_rpc:

Java RPC
********

.. note::

    This information refers to releases up to 0.7.x. It needs to be updated for the current releases %{version}.

.. _pages/rpc_java#building_a_qooxdoo_test_application:

Building a qooxdoo test application
===================================

The Java backend comes with a ``build.xml`` file that generates a web application archive (WAR). (In order to use this build file, you need to have `Ant <http://ant.apache.org/>`_ installed.) The resulting WAR contains all the necessary server-side and client-side classes to experiment with the RPC mechanism.

To build the test WAR, simply follow these steps on the command line:

::

    cd /qooxdoo/frontend
    make build
    cd /qooxdoo/backend/java
    ant

Now deploy the WAR in a Java web server of your choice (e.g. `Apache Tomcat <http://tomcat.apache.org/>`_). You can then point your browser to one of the RPC test pages (e.g. ``http://localhost:8080/qooxdoo/sample/html/test/RPC_1.html``) to see the RPC mechanism in action.

Future qooxdoo releases may also include a pre-built Java backend.

.. _pages/rpc_java#building_your_own_applications:

Building your own applications
==============================

You can use the supplied ``build.xml`` as a starting point for your own applications. For example, you can modify it to include your own applications instead of the qooxdoo examples. Or you can modify it to build a JAR with the qooxdoo RPC classes and add that to an already existing webapp of yours. In this case, you have to add a mapping for the RpcServlet in your web.xml (see ``webapp/WEB-INF/web.xml`` in the Java backend).

For development, you can use cross-domain calls (see below). This way, you can load HTML and script files via ``file://`` URLs, and only the server part needs to be packaged in a WAR. To see any client-side changes, simply reload the page. When you're ready to put the application into production, set cross-domain to false and add the client part to the WAR. There are also more sophisticated solutions (e.g. using a servlet and a custom classloader to load scripts), but these are beyond the scope of this article.

