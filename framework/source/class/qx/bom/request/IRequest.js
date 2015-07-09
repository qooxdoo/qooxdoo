/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * Interface of a low-level transport compatible with
 * {@link qx.io.request.AbstractRequest}.
 *
 * Based on interface specified in
 * <a href="http://www.w3.org/TR/XMLHttpRequest/">XmlHttpRequest</a>. Also
 * borrows some methods as described in
 * <a href="http://www.w3.org/TR/XMLHttpRequest2/">XmlHttpRequest2</a>.
 */
qx.Interface.define("qx.bom.request.IRequest",
{

  members :
  {
    //
    // Properties
    // (Plain JavaScript)
    //

    /**
     * @type {Object} Native transport.
     */
    transport: null,

    /**
     * @type {Number} Ready state.
     *
     * States can be:
     * UNSENT:           0,
     * OPENED:           1,
     * HEADERS_RECEIVED: 2,
     * LOADING:          3,
     * DONE:             4
     */
    readyState: 0,

    /**
     * @type {Number} The status code.
     */
    status: 0,

    /**
     * @type {String} The status text.
     */
    statusText: "",

    /**
     * @type {String} The response of the request as text.
     */
    responseText: "",

    /**
     * @type {Number} Timeout limit in milliseconds.
     *
     * 0 (default) means no timeout.
     */
    timeout: 0,

    //
    // Methods
    //

    /**
     * Initializes (prepares) request.
     *
     * @param method {String}
     *  The method to use.
     * @param url {String}
     *  The URL to which to send the request.
     * @param async {Boolean?true}
     *  Whether or not to perform the operation asynchronously.
     */
    open: function(method, url, async) {
      this.assertArgumentsCount(arguments, 2, 3);
      this.assertString(method);
      this.assertString(url);
      this.assert(async === undefined || async === null || qx.lang.Type.isBoolean(async), "Expected value to be undefined, null or boolean but found " + async);
      this.assert(async || );
    },

    /**
     * Sends request.
     *
     * @param data {String|Document?null}
     *  Optional data to send.
     */
    send: function(data) {
      this.assertArgumentsCount(arguments, 0, 1);
      this.assert(data === undefined || data === null || qx.lang.Type.isString(data) /*|| test Document*/, "Expected value to be undefined, null, string or document but found " + data);
kols      this.assertString(data, true);
    },

    /**
     * Abort request
     */
    abort: function() {},

    /**
     * Get all response headers from response.
     *
     * @return {String} All response headers.
     */
    getAllResponseHeaders: function() {},

    /**
     * Get a single response header from response.
     *
     * @param header {String}
     *  Key of the header to get the value from.
     * @return {String}
     *  Response header.
     */
    getResponseHeader: function(header) {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertString(header);
    },

    /**
     * Sets a request header to be used by the request.
     *
     * @param key {String}
     *  The name of the header whose value is to be set.
     * @param value {String}
     *  The value to set as the body of the header.
     */
    setRequestHeader: function(key, value) {
      this.assertArgumentsCount(arguments, 2, 2);
      this.assertString(key);
      this.assertString(value);
    },

    //
    // Handlers
    //

    /**
     * Event handler for event fired at every state change.
     */
    onreadystatechange: function() {},

    /**
     * Event handler for event fired on successful retrieval.
     */
    onload: function() {},

    /**
     * Event handler for event fired on retrieval.
     */
    onloadend: function() {},

    /**
     * Event handler for event fired on a network error.
     */
    onerror: function() {},

    /**
    * Event handler for event fired when request is aborted.
    */
    onabort: function() {},

    /**
    * Event handler for event fired when timeout interval has passed.
    */
    ontimeout: function() {}
  }
});
