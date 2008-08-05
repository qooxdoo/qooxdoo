/**
 * The qx.io.remote package provides classes for remote communiction, i.e.
 * communication of the client with a server. Bear in mind that this usually
 * means communication with the server the client application was loaded from.
 * Cross-domain communication on the other hand has to be treated specially.
 * <p>
 * In the most common cases the {@link Request} class is the
 * class you will be working with. It allows you to set up a request for a
 * remote resource, configure request data and request processing details, and
 * set up event handlers for typical stages of the request processing. A brief
 * example:
 * <pre class='javascript'>
 * var req = new qx.io.remote.Request("/my/resource/url.txt");
 * req.addListener("completed", function (e) {
 *   alert(e.getContent());
 * });
 * req.send();
 * </pre>
 * Event handlers are essential for obtaining the outcome of a request. The
 * parameter passed into the event handler ("<i>e</i>" in our example) is of type
 * {@link qx.io.remote.Response Response}, which provides you with various
 * methods to inspect the outcome of your request and retrieve response data.
 * Internally, requests are managed using a {@link qx.io.remote.RequestQueue
 * RequestQueue} class. The RequestQueue is a singleton and there is no need to
 * deal with it in client code directly.
 * <p>
 * The {@link qx.io.remote.Rpc Rpc} class provides you with another high-level
 * interface to server interaction.  You will usually use this class if you have
 * a server-based "service" that you want to make accessible on the client side
 * via an RPC-like interface. So this class will be especially interesting for
 * providing a general interface that can be used in various places of the
 * application code through a standard API.
 * <p>
 * On a technical level of data exchange with the server, the <i>*Transport</i>
 * classes implement different schemes.  Common features of these transport
 * classes are collected in the {@link qx.io.remote.transport.Abstract
 * AbstractRemoteTransport} class, and {@link qx.io.remote.transport.Iframe
 * IframeTransport}, {@link qx.io.remote.transport.Script ScriptTransport} and
 * {@link qx.io.remote.transport.XmlHttp XmlHttpTransport} specialize them,
 * depending of their interaction model with the server. Usually, you will
 * use one of these classes to taylor the implementation details of a specific
 * client-server communication in your application. Mind that the
 * IframeTransport and ScriptTransport classes are still abstract, so you have
 * to provide a subclass implementation to make use of them.
 * <p>
 * The connection between your Request object and a specific Transport is
 * established through an {@link qx.io.remote.Exchange Exchange} object. An
 * Exchange object can be bound to the {@link qx.io.remote.Request#transport
 * <i>.transport</i>} property of a Request, and takes care
 * that the particular request is realised over the specific Transport. This
 * allows you to accommodate a wide varity of transport options without
 * overloading the Request object with the details.
 *
 * <h4> Cross-Domain Requests </h4>
 *
 * Sending cross-domain requests, i.e. sending a request to a URL with a domain
 * part other than the domain of the current document, require special treatment
 * since the security concept of most browsers restrict such requests.
 * <p>
 * Currently, those requests are realised through the dynamic insertion of a
 * "script" tag into the current document (this is the beforementioned {@link
 * qx.io.remote.transport.Script ScriptTransport}). The "src" attribute of the
 * script tag is set to the requested URL. On insertion of the script tag the
 * browser will load the source URL and parse and execute the returned content
 * as JavaScript.  This means that the returned data has to be valid JavaScript!
 * <p>
 * In order to do that and to link the completion of the script transport to
 * your normal request "completed" event handler, it is best to wrap the
 * returned data in a call to the {@link
 * qx.io.remote.transport.Script#_requestFinished} static.  Additional to the
 * response data, this method takes a script transport id as a parameter,
 * available to the server side as the "_ScriptTransport_id" request variable.
 * (Normal GET or POST data of the request is available through the
 * "_ScriptTransport_data" variable). In the response data, you also have to
 * take care of proper string escaping.
 * <p>
 * So the request you might see in your server log from a script tansport
 * may look like this:
 * <pre>
 * "GET /cgi-bin/qxresponse.cgi?_ScriptTransport_id=10&_ScriptTransport_data=action%3Ddoit HTTP/1.1" 200 -
 * </pre>
 * and the string you might return as content may look like this:
 * <pre>
 * 'qx.io.remote.ScriptTransport._requestFinished(10, "Thank you for asking");'
 * </pre>
 *
 *
 */
