RPC (Remote Procedure Call)
===========================

**qooxdoo includes an advanced RPC mechanism for direct calls to server-side methods. It allows you to write true client/server applications without having to worry about the communication details.**

The qooxdoo RPC is based on [JSON-RPC](http://json-rpc.org/) as the serialization and method call protocol, and qooxdoo provides server backends for Java, PHP, and Perl projects. A Python backend library is also provided by a third party. All parameters and return values are automatically converted between JavaScript and the server-side language.

JSON-RPC Protocol
-----------------

According to [JSON-RPC (Wikipedia)](http://en.wikipedia.org/wiki/JSON-RPC) "[JSON-RPC] is a very simple protocol (and very similar to XML-RPC), defining only a handful of data types and commands. In contrast to XML-RPC or SOAP, it allows for bidirectional communication between the service and the client, treating each more like peers and allowing peers to call one another or send notifications to one another. It also allows multiple calls to be sent to a peer which may be answered out of order." The current servers do not yet support bi-directional communication.

Setup
-----

To make use of the RPC, you need to set up a server backend first.

Configuration of each server backend needs slightly different treatment. Please see the [backend](http://qooxdoo.org/contrib/project#backend) relevant to you.

Your favorite language is missing? Feel free to write your own qooxdoo RPC server, consult the rpc\_server\_writer\_guide for details.

Making remote calls
-------------------

### Basic call syntax

To make remote calls, you need to create an instance of the Rpc class:

    var rpc = new qx.io.remote.Rpc(
        "http://localhost:8080/qooxdoo/.qxrpc",
        "qooxdoo.test"
    );

The first parameter is the URL of the backend (in this example a Java backend on localhost). The second is the name of the service you'd like to call. In Java, this is the fully qualified name of a class. (The Java backend includes the `qooxdoo.test` service used in the example. The class name is lowercase to keep it in sync with the PHP examples - in Java-only projects, you would of course use standard Java naming conventions.)

When you have the Rpc instance, you can make synchronous and asynchronous calls:

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

You can also use qooxdoo event listeners for asynchronous calls - just use `callAsyncListeners` instead of `callAsync`. More details can be found in the [API documentation](http://api.qooxdoo.org/#qx.io.remote.Rpc).

One difference between the qooxdoo RPC and other RPC implementations are client stubs. These are small wrapper classes that provide the same methods as the corresponding server classes, so they can be called like ordinary JavaScript methods. In qooxdoo, there are no such stubs by default, so you have to provide the method name as a string. The advantage is that there's no additional build step for generating stubs, and it's also not necessary to "register" your server classes at runtime (which would be a prerequisite for dynamic stub generation). If you really want or need client stubs, you currently have to write the stubs (or a generator for them) yourself. Future qooxdoo versions may include such a generator.

### Parameter and result conversion

All method parameters and result values are automatically converted to and from the backend language. Using the Java backend, you can even have overloaded methods, and the correct one will be picked based on the provided parameters.

The following table lists the data types supported by the Java backend and the corresponding JavaScript types:

|Java type|JavaScript type|
|---------|---------------|
|int, long, double, Integer, Long, Double|number|
|boolean, Boolean|boolean|
|String|String|
|java.util.Date|Date|
|Array (of any of the supported types)|Array|
|java.util.Map|Object|
|JavaBean|Object|

The first few cases are quite simple, but the last two need some more explanation. If a Java method expects a `java.util.Map`, you can send any JavaScript object to it. All properties of the object are converted to Java and become members of the Java Map. When a Map is used as a return value, it's converted to a JavaScript object in a similar way: A new object is created, and then all key/value pairs in the map are converted themselves and then added as properties to this object. (Please note that "properties" is used here in the native JavaScript sense, not in the sense of qooxdoo properties \<core/understanding\_properties\>.)

JavaBeans are converted in a similar way. The properties of the JavaBean become JavaScript properties and vice versa. If a JavaScript object contains properties for which no corresponding setters exist in the JavaBean, they are ignored.

For performance reasons, recursive conversion of JavaBeans and Maps is performed without checking for cycles! If there's a reference cycle somewhere, you end up with a StackOverflowException. The same is true when you try to send a JavaScript object to the server: If it (indirectly) references itself, you get a recursion error in the browser.

Besides the fully-automatic conversions, there's also a class hinting mechanism. You can use it in case you need to send a specific sub-class to the server (see below for details). However, it can't be used to instantiate classes without a default constructor yet. Future qooxdoo versions may provide more extensive class hinting support.

### Aborting a call

You can abort an asynchronous call while it's still being performed:

    // Rpc instantiation and handler function left out for brevity

    var callref = rpc.callAsync(handler, "echo", "Test");

    // ...

    rpc.abort(callref);
      // the handler will be called with an abort exception

### Error handling

When you make a synchronous call, you can catch an exception to handle errors. In its `rpcdetails` property, the exception contains an object that describes the error in more detail. The same details are also available in the second parameter in an asynchronous handler function, as well as in the events fired by `callAsyncListeners`.

The following example shows how errors can be handled:

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

The following `origin`'s are defined:

The `code` depends on the origin. For the server and application origins, the possible codes are defined by the backend implementation. For transport errors, it's the HTTP status code. For local errors, the following codes are defined:

|Constant|Meaning|
|--------|-------|
|qx.io.remote.Rpc.localError.timeout|A timeout occurred.|
|qx.io.remote.Rpc.localError.abort|The call was aborted.|

### Cross-domain calls

Using the qooxdoo RPC implementation, you can also make calls across domain boundaries. On the client side, all you have to do is specify the correct destination URL in the Rpc constructor and set the crossDomain property to `true`:

    var rpc = new qx.io.remote.Rpc("http://targetdomain.com/appname/.qxrpc");
    rpc.setCrossDomain(true);

On the server side, you need to configure the backend to accept cross-domain calls (see the documentation comments in the various backend implementations).

Writing your own services
-------------------------

### Java

Writing your own remotely callable methods is very easy. Just create a class like this:

    package my.package;

    import net.sf.qooxdoo.rpc.RemoteService;
    import net.sf.qooxdoo.rpc.RemoteServiceException;

    public class MyService implements RemoteService {

        public int add(int a, int b) throws RemoteServiceException {
            return a + b;
        }

    }

All you need to do is include this class in your webapp (together with the qooxdoo backend classes), and it will be available for calls from JavaScript! You don't need to write or modify any configuration files, and you don't need to register this class anywhere. The only requirements are:

1.  The class has to implement the `RemoteService` interface. This is a so-called tagging interface, i.e. it has no methods.
2.  All methods that should be remotely available must be declared to throw a `RemoteServiceException`.

Both requirements are there to protect arbitrary Java code from being called.

#### Accessing the session

There is one instance of a service class per session. To get access to the current session, you can provide an *injection* method called `setQooxdooEnvironment`:

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

The environment provides access to the current request (via `getRequest`) and the RpcServlet instance that is handling the current call (via `getRpcServlet`).

Debugging Backends
------------------

In order to debug your service methods on the backend independently of the client application, use the [RpcConsole](http://qooxdoo.org/contrib/project#rpcconsole) contribution.

Creating mockup data
--------------------

The RpcConsole also contains a mixin class for qx.io.remote.Rpc which allows to prepare code relying on a json-rpc backend to work with static mockup data independently of the server. This allows to develop client and server independently and to create static demos. For more information, see the documentation of the [RpcConsole (project)](http://qooxdoo.org/contrib/project/rpcconsole) contribution.

qooxdoo JSON-RPC specification
------------------------------

In order to qualify as a qooxdoo json-rpc backend, a server must comply with the qooxdoo JSON-RPC server specifications. See the rpc\_server\_writer\_guide for more details.

### Adding to the standard

If you think that the standard is missing a feature that should be implemented in all backends, please add it as a [bug](http://bugzilla.qooxdoo.org/enter_bug.cgi?product=contrib&component=RpcExample), marking it as a "core feature request".

### Extending the standard

If a server *extends* the standard with a certain optional behavior, please add a detailed description to it on the [JSON-RPC Extensions page](http://qooxdoo.org/docs/general/rpc/jsonrpc_extensions), with information which server implements this behavior. Please also add a [bug](http://bugzilla.qooxdoo.org/enter_bug.cgi?product=contrib&component=RpcExample), marked as a "extension" so that other server maintainers can discuss the pros and cons of adding the extension to their own servers.
