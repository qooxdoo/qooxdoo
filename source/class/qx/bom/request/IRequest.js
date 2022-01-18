/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
qx.Interface.define("qx.bom.request.IRequest", {
  members: {
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
    open(method, url, async) {},

    /**
     * Sends request.
     *
     * @param data {String|Document?null}
     *  Optional data to send.
     */
    send(data) {},

    /**
     * Abort request
     */
    abort() {},

    /**
     * Get all response headers from response.
     *
     * @return {String} All response headers.
     */
    getAllResponseHeaders() {},

    /**
     * Get a single response header from response.
     *
     * @param header {String}
     *  Key of the header to get the value from.
     * @return {String}
     *  Response header.
     */
    getResponseHeader(header) {},

    /**
     * Sets a request header to be used by the request.
     *
     * @param key {String}
     *  The name of the header whose value is to be set.
     * @param value {String}
     *  The value to set as the body of the header.
     */
    setRequestHeader(key, value) {},

    //
    // Handlers
    //

    /**
     * Event handler for event fired at every state change.
     */
    onreadystatechange() {},

    /**
     * Event handler for event fired on successful retrieval.
     */
    onload() {},

    /**
     * Event handler for event fired on retrieval.
     */
    onloadend() {},

    /**
     * Event handler for event fired on a network error.
     */
    onerror() {},

    /**
     * Event handler for event fired when request is aborted.
     */
    onabort() {},

    /**
     * Event handler for event fired when timeout interval has passed.
     */
    ontimeout() {}
  }
});
