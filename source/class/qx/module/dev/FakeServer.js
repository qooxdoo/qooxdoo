/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

************************************************************************ */
/**
 * A wrapper around Sinon.JS's FakeXMLHttpRequest and FakeServer features that
 * allows quick and simple configuration of mock HTTP backends for testing and
 * development.
 * Automatically creates URL filtering rules to ensure that only configured
 * requests are faked while others will be processed normally by the browser's
 * XHR implementation.
 *
 * @group (IO)
 */
qx.Bootstrap.define("qx.module.dev.FakeServer", {
  statics :
  {
    /**
     * Configures a set of fake HTTP responses. Each response is defined as a map
     * that must provide the following keys:
     * <ul>
     *   <li><code>method</code> HTTP method to respond to, e.g. <code>PUT</code></li>
     *   <li><code>url</code> URL used to match requests to fake responses. Can be
     *   a RegExp or a String. REST-style parameter placeholders in curly braces
     *   will be replaced with wildcards, e.g. the string "/resource/{resourceId}"
     *   is interpreted as the RegExp <code>/\/resource\/\{.*?\}/</code>
     *   <li><code>response</code> This can be either:
     *     <ul>
     *       <li>a string: This will be the response body, status code will be 200</li>
     *       <li>an array containing the status code, a map of response headers and
     *         the response text, e.g. <code>[200, { "Content-Type": "text/html" }, "OK"]</code>
     *       </li>
     *       <li>a function: This will be called with a FakeXMLHttpRequest object as
     *       the only argument. Its <code>respond</code> method must be called to send a response.
     *       See <a href="http://sinonjs.org/docs/#respond">Sinon.JS: Respond</a> for details.
     *       </li>
     *     </ul>
     *   </li>
     * </ul>
     *
     * @attachStatic {qxWeb, dev.fakeServer.configure}
     * @param responseData {Map[]} An array of response description maps.
     */
    configure : function(responseData) {
      qx.dev.FakeServer.getInstance().configure(responseData);
    },


    /**
     * Removes a response that was configured with {@link #configure}
     * @param method {String} HTTP method of the response
     * @param url {String|RegExp} URL of the response
     *
     * @attachStatic {qxWeb, dev.fakeServer.removeResponse}
     */
    removeResponse : function(method, url) {
      qx.dev.FakeServer.getInstance().removeResponse(method, url);
    },

    /**
     * Adds a URL filtering function to decide whether a request should be handled
     * by the FakeServer or passed to the regular XMLHttp implementation.
     * See <a href="http://sinonjs.org/docs/#filtered-requests">Sinon.JS: Filtered Requests</a>
     * for details.
     *
     * @attachStatic {qxWeb, dev.fakeServer.addFilter}
     * @param filter {Function} URL filter function. Will be called with the
     * following arguments: <code>method</code>, <code>url</code>, <code>async</code>,
     * <code>username</code>, <code>password</code>. Must return <code>true</code>
     * if the request should not be faked.
     */
    addFilter : function(filter) {
      qx.dev.FakeServer.getInstance().addFilter(filter);
    },


    /**
     * Remove a filter that was added with {@link #addFilter}
     * @param filter {Function} filter function to remove
     *
     * @attachStatic {qxWeb, dev.fakeServer.removeFilter}
     */
    removeFilter : function(filter) {
      qx.dev.FakeServer.getInstance().removeFilter(filter);
    },


    /**
     * Defines a fake XHR response to a matching request.
     *
     * @attachStatic {qxWeb, dev.fakeServer.respondWith}
     * @param method {String} HTTP method to respond to, e.g. "GET"
     * @param urlRegExp {RegExp} Request URL must match match this expression
     * @param response {Function|Array|String} Response to send. See
     * <a href="http://sinonjs.org/docs/#fakeServer">Sinon.JS: Fake Server</a> for details.
     */
    respondWith : function(method, urlRegExp, response) {
      qx.dev.FakeServer.getInstance().respondWith(method, urlRegExp, response);
    },


    /**
     * Creates and configures a FakeServer if necessary and returns it.
     *
     * @attachStatic {qxWeb, dev.fakeServer.getFakeServer}
     * @return {Object} FakeServer object
     */
    getFakeServer : function() {
      return qx.dev.FakeServer.getInstance().getFakeServer();
    },


    /**
     * Stops the FakeServer and removes all configured responses and/or filters.

     * @attachStatic {qxWeb, dev.fakeServer.restore}
     */
    restore: function() {
      qx.dev.FakeServer.getInstance().restore();
    }
  },

  defer : function(statics) {
    qxWeb.$attachStatic({
      "dev": {
        "fakeServer" : {
          "configure" : statics.configure,
          "removeResponse" : statics.removeResponse,
          "addFilter" : statics.addFilter,
          "removeFilter" : statics.removeFilter,
          "respondWith" : statics.respondWith,
          "getFakeServer" : statics.getFakeServer,
          "restore" : statics.restore
        }
      }
    });
  }
});
