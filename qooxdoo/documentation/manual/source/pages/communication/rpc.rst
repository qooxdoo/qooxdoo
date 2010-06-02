.. _pages/rpc#rpc_remote_procedure_call:

RPC (Remote Procedure Call)
***************************

**qooxdoo includes an advanced RPC mechanism for direct calls to server-side methods. It allows you to write true client/server applications without having to worry about the communication details.** 

The qooxdoo RPC is based on `JSON-RPC <http://json-rpc.org/>`_ as the serialization and method call protocol, and qooxdoo provides server backends for Java, PHP, and Perl projects. A Python backend library is also provided by a third party. All parameters and return values are automatically converted between JavaScript and the server-side language.

.. _pages/rpc#setup:

Setup
=====

To make use of the RPC, you need to set up a server backend first.

Configuration of each server backend needs slightly different treatment. Please see the page relevant to you:

* :doc:`Java <rpc_java>`
* :doc:`PHP <rpc_php>`
* :doc:`Perl <rpc_perl>`
* :doc:`Python <rpc_python>`

Your favorite language is missing? Feel free to write your own qooxdoo RPC server, consult the :doc:`rpc_server_writer_guide` for details.

.. _pages/rpc#making_remote_calls:

Making remote calls
===================

.. _pages/rpc#basic_call_syntax:

Basic call syntax
-----------------

To make remote calls, you need to create an instance of the Rpc class:

::

    var rpc = new qx.io.remote.Rpc(
        "http://localhost:8080/qooxdoo/.qxrpc",
        "qooxdoo.test"
    );

The first parameter is the URL of the backend (in this example a Java backend on localhost). The second is the name of the service you'd like to call. In Java, this is the fully qualified name of a class. (The Java backend includes the ``qooxdoo.test`` service used in the example. The class name is lowercase to keep it in sync with the PHP examples - in Java-only projects, you would of course use standard Java naming conventions.)

When you have the Rpc instance, you can make synchronous and asynchronous calls:

::

    // synchronous call
    try {
        var result = rpc.callSync("echo", "Test");
        alert("Result of sync call: " + result);
    } catch (exc) {
        alert("Exception during sync call: " + exc);
    }

    // asynchronous call
    var handler = function(result, exc) {
        if (exc == null) {
            alert("Result of async call: " + result);
        } else {
            alert("Exception during async call: " + exc);
        }
    };
    rpc.callAsync(handler, "echo", "Test");

For synchronous calls, the first parameter is the method name. After that, one or more parameters for this method may follow (in this case, a single string). Please note that synchronous calls typically block the browser UI until the result arrives, so they should only be used sparingly (if at all)!

Asynchronous calls work similarly. The only difference is an additional first parameter that specifies a handler function. This function is called when the result of the method call is available or when an exception occurred.

You can also use qooxdoo event listeners for asynchronous calls - just use ``callAsyncListeners`` instead of ``callAsync``. More details can be found in the `API documentation <http://api.qooxdoo.org/#qx.io.Remote.Rpc>`_.

One difference between the qooxdoo RPC and other RPC implementations are client stubs. These are small wrapper classes that provide the same methods as the corresponding server classes, so they can be called like ordinary JavaScript methods. In qooxdoo, there are no such stubs by default, so you have to provide the method name as a string. The advantage is that there's no additional build step for generating stubs, and it's also not necessary to "register" your server classes at runtime (which would be a prerequisite for dynamic stub generation). If you really want or need client stubs, you currently have to write the stubs (or a generator for them) yourself. Future qooxdoo versions may include such a generator.

.. _pages/rpc#parameter_and_result_conversion:

Parameter and result conversion
-------------------------------

All method parameters and result values are automatically converted to and from the backend language. Using the Java backend, you can even have overloaded methods, and the correct one will be picked based on the provided parameters.

The following table lists the data types supported by the Java backend and the corresponding JavaScript types:

=========================================  ===============
Java type                                  JavaScript type  
=========================================  ===============
int, long, double, Integer, Long, Double   number           
boolean, Boolean                           boolean          
String                                     String           
java.util.Date                             Date             
Array (of any of the supported types)      Array            
java.util.Map                              Object           
JavaBean                                   Object           
=========================================  ===============

The first few cases are quite simple, but the last two need some more explanation. If a Java method expects a ``java.util.Map``, you can send any JavaScript object to it. All properties of the object are converted to Java and become members of the Java Map. When a Map is used as a return value, it's converted to a JavaScript object in a similar way: A new object is created, and then all key/value pairs in the map are converted themselves and then added as properties to this object. (Please note that "properties" is used here in the native JavaScript sense, not in the sense of :doc:`qooxdoo properties </pages/core/understanding_properties>`.)

JavaBeans are converted in a similar way. The properties of the JavaBean become JavaScript properties and vice versa. If a JavaScript object contains properties for which no corresponding setters exist in the JavaBean, they are ignored.

For performance reasons, recursive conversion of JavaBeans and Maps is performed without checking for cycles! If there's a reference cycle somewhere, you end up with a StackOverflowException. The same is true when you try to send a JavaScript object to the server: If it (indirectly) references itself, you get a recursion error in the browser.

Besides the fully-automatic conversions, there's also a class hinting mechanism. You can use it in case you need to send a specific sub-class to the server (see below for details). However, it can't be used to instantiate classes without a default constructor yet. Future qooxdoo versions may provide more extensive class hinting support.

.. _pages/rpc#aborting_a_call:

Aborting a call
---------------

You can abort an asynchronous call while it's still being performed:

::

    // Rpc instantiation and handler function left out for brevity

    var callref = rpc.callAsync(handler, "echo", "Test");

    // ...

    rpc.abort(callref);
      // the handler will be called with an abort exception

.. _pages/rpc#error_handling:

Error handling
--------------

When you make a synchronous call, you can catch an exception to handle errors. In its ``rpcdetails`` property, the exception contains an object that describes the error in more detail. The same details are also available in the second parameter in an asynchronous handler function, as well as in the events fired by ``callAsyncListeners``.

The following example shows how errors can be handled:

::

    // creation of the Rpc instance left out for brevity

    var showDetails = function(details) {
        alert(
            "origin: " + details.origin +
            "; code: " + details.code +
            "; message: " + details.message
        );
    };

    // error handling for sync calls
    try {
        var result = rpc.callSync("echo", "Test");
    } catch (exc) {
        showDetails(exc.rpcdetails);
    }

    // error handling for async calls
    var handler = function(result, exc) {
        if (exc != null) {
            showDetails(exc);
        }
    };
    rpc.callAsync(handler, "echo", "Test");

The following ``origin``'s are defined:

====================================  ======================================================================================================================================================================
 Constant                              Meaning                                                                                                                                                                
====================================  ======================================================================================================================================================================
 qx.io.remote.Rpc.origin.server        The error occurred on the server (e.g. when a non-existing method is called).                                                                                          
 qx.io.remote.Rpc.origin.application  The error occurred inside the server application (i.e. during a method call in non-qooxdoo code).                                                                       
 qx.io.remote.Rpc.origin.transport     The error occurred in the communication layer (e.g. when the Rpc instance was constructed with an URL where no backend is deployed, resulting in an HTTP 404 error).   
 qx.io.remote.Rpc.origin.local         The error occurred locally (when the call timed out or when it was aborted).                                                                                           
====================================  ======================================================================================================================================================================

The ``code`` depends on the origin. For the server and application origins, the possible codes are defined by the backend implementation. For transport errors, it's the HTTP status code. For local errors, the following codes are defined:

===================================  =====================
Constant                             Meaning                
===================================  =====================
qx.io.remote.Rpc.localError.timeout  A timeout occurred.    
qx.io.remote.Rpc.localError.abort    The call was aborted.  
===================================  =====================

.. _pages/rpc#cross-domain_calls:

Cross-domain calls
------------------

Using the qooxdoo RPC implementation, you can also make calls across domain boundaries. On the client side, all you have to do is specify the correct destination URL in the Rpc constructor and set the crossDomain property to ``true``:

::

    var rpc = new qx.io.remote.Rpc("http://targetdomain.com/appname/.qxrpc");
    rpc.setCrossDomain(true);

On the server side, you need to configure the backend to accept cross-domain calls (see the documentation comments in the various backend implementations).

.. _pages/rpc#writing_your_own_services:

Writing your own services
=========================

.. _pages/rpc#java:

Java
----

Writing your own remotely callable methods is very easy. Just create a class like this:

::

    package my.package;

    import net.sf.qooxdoo.rpc.RemoteService;
    import net.sf.qooxdoo.rpc.RemoteServiceException;

    public class MyService implements RemoteService {

        public int add(int a, int b) throws RemoteServiceException {
            return a + b;
        }

    }

All you need to do is include this class in your webapp (together with the qooxdoo backend classes), and it will be available for calls from JavaScript! You don't need to write or modify any configuration files, and you don't need to register this class anywhere. The only requirements are:

#. The class has to implement the ``RemoteService`` interface. This is a so-called tagging interface, i.e. it has no methods.
#. All methods that should be remotely available must be declared to throw a ``RemoteServiceException``.

Both requirements are there to protect arbitrary Java code from being called.

.. _pages/rpc#accessing_the_session:

Accessing the session
^^^^^^^^^^^^^^^^^^^^^

There is one instance of a service class per session. To get access to the current session, you can provide an *injection* method called ``setQooxdooEnvironment``:

::

    package my.package;

    import javax.servlet.http.HttpSession;

    import net.sf.qooxdoo.rpc.Environment;
    import net.sf.qooxdoo.rpc.RemoteService;
    import net.sf.qooxdoo.rpc.RemoteServiceException;

    public class MyService implements RemoteService {

        private Environment _env;

        public void setQooxdooEnvironment(Environment env) {
            _env = env;
        }

        public void someRemoteMethod() throws RemoteServiceException {
            HttpSession session = _env.getRequest().getSession();
        }

    }

The environment provides access to the current request (via ``getRequest``) and the RpcServlet instance that is handling the current call (via ``getRpcServlet``).

.. _pages/rpc#advanced_java_topics:

Advanced Java topics
====================

.. _pages/rpc#automatic_client_configuration:

Automatic client configuration
------------------------------

The Java RPC backend contains an auto-config mechanism, mainly used for automatically detecting the server URL. You can access it by including the following script tag in your HTML page:

.. code-block:: html

    <html>
        <head>
            <!-- ... -->
            <script type="text/javascript" src=".qxrpc"></script>
        </head>
    </html>

Provided the HTML page is part of the webapp (and not loaded via file:\*...), and provided that you didn't change the default mapping of the RpcServlet (``.qxrpc``), any request to ``http://server/app/foo/bar.qxrpc`` (or anything else that ends with .qxrpc) will always be directed to the RpcServlet. The RpcServlet fills a structure with basic information about the server. It may answer with something like

::

    qx.core.ServerSettings = {serverPathPrefix: 'http://server/app', ...}

and this is used by the ``makeServerURL()`` helper method in the RPC class. You can use this when instantiating an RPC instance:

::

    var rpc = new qx.io.remote.Rpc(
        qx.io.remote.Rpc.makeServerURL(),
        "my.package.MyService"
    );

This way, you don't need to hardcode the URL of the service. Your client code will work without modifications, no matter what the name of your application is or where it is deployed. By generating absolute URLs you don't have to worry about moving around web pages and scripts in the directory structure, which is a common shortcoming of relative URLs. The auto-configration feature is also convenient if you need to embed a session id into the URL.

.. _pages/rpc#subclassing_rpcservlet:

Subclassing RpcServlet
----------------------

It can be useful to create your own version of qooxdoo's ``RpcServlet``. Some of the benefits of subclassing it are:

#. **Custom object conversion**: By creating your own subclass, you can provide code for custom conversion of objects. This is especially useful for classes that don't have a default constructor.
#. **Detailed server logging**: You can hook your own code into the method calling mechanism, e.g. to provide detailed failure logging (the JavaScript side only receives rather generic errors).
#. **Property filtering**: For methods that return JavaBeans, you can filter the properties that should be sent to the client. This can save a lot of bandwidth without having to completely wrap the result in a custom object.
#. **Class hinting**: For security reasons, the class hinting mechanism isn't active by default (otherwise, client code could instantiate arbitrary server classes). By overriding a method, you can enable it on a case-by-case basis.

The following example code shows how all of this can be done:

::

    package my.package;

    import java.lang.reflect.InvocationTargetException;
    import java.util.Calendar;
    import java.util.Map;

    import net.sf.qooxdoo.rpc.RpcServlet;
    import net.sf.qooxdoo.rpc.RemoteCallUtils;

    import org.json.JSONArray;

    public class MyRpcServlet extends RpcServlet {

        protected RemoteCallUtils getRemoteCallUtils() {
            return new RemoteCallUtils() {

                // log exceptions by overriding callCompatibleMethod

                protected Object callCompatibleMethod(Object instance,
                        String methodName, JSONArray parameters)
                        throws Exception {
                    try {
                        return super.callCompatibleMethod(instance, methodName, parameters);
                    } catch (Exception exc) {
                        exc.printStackTrace();
                        throw exc;
                    }
                }

                // influence object conversion

                public Object toJava(Object obj, Class targetType) {
                    // insert custom conversion to Java here
                    // (default: call super method)
                    return super.toJava(obj, targetType);
                }

                public Object fromJava(Object obj)
                    throws IllegalAccessException, InvocationTargetException,
                    NoSuchMethodException {

                    // use Dates instead of Calendars (so that the
                    // client code receives native JavaScript dates)
                    if (obj instanceof Calendar) {
                        return super.fromJava(((Calendar) obj).getTime());
                    }

                    return super.fromJava(obj);
                }

                // filter unwanted bean properties

                protected Map filter(Object obj, Map map) {
                    if (obj instanceof Date) {
                        map.remove("timezoneOffset");
                    }
                    return super.filter(obj, map);
                }

                // class hinting

                protected Class resolveClassHint(String requestedTypeName,
                        Class targetType) throws Exception {
                    // allow class hinting in some cases
                    // (useful for methods that expect a superclass
                    // of SubClassA and SubClassB)
                    if (requestedTypeName.equals("my.package.SubClassA") ||
                        requestedTypeName.equals("my.package.SubClassB")) {
                        return Class.forName(requestedTypeName);
                    } else {
                        return super.resolveClassHint(requestedTypeName, targetType);
                    }
                }
            };
        }
    }

To make use of class hinting on the client side, you have to send objects with a ``class`` attribute:

::

    rpc.callAsync(handler, "testMethod",
        {"class": "my.package.SubClassA",
         property1: 123,
         property2: 456,
         /* ... */
        });

Please note that ``class`` is a reserved word in JavaScript, so you have to enclose it in quotes.
