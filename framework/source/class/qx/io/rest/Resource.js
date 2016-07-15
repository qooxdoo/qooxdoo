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
     * Richard Sternagel (rsternagel)

************************************************************************ */

/**
 * Client-side wrapper of a REST resource.
 *
 * Each instance represents a resource in terms of REST. A number of actions
 * (usually HTTP methods) unique to the resource can be defined and invoked.
 * A resource with its actions is configured declaratively by passing a resource
 * description to the constructor, or programmatically using {@link #map}.
 *
 * Each action is associated to a route. A route is a combination of method,
 * URL pattern and optional parameter constraints.
 *
 * An action is invoked by calling a method with the same name. When a URL
 * pattern of a route contains positional parameters, those parameters must be
 * passed when invoking the associated action. Also, constraints defined in the
 * route must be satisfied.
 *
 * When an action is invoked, a request is configured according to the associated
 * route, is passed the URL parameters, request body data, and finally send.
 * What kind of request is send can be configured by overwriting {@link #_getRequest}.
 *
 * No constraints on the action's name or the scope of the URLs are imposed. However,
 * if you want to follow RESTful design patterns it is recommended to name actions
 * the same as the HTTP action.
 *
 * <pre class="javascript">
 * var description = {
 *  "get": { method: "GET", url: "/photo/{id}" },
 *  "put": { method: "PUT", url: "/photo/{id}"},
 *  "post": { method: "POST", url: "/photos/"}
 * };
 * var photo = new qx.io.rest.Resource(description);
 * // Can also be written: photo.invoke("get", {id: 1});
 * photo.get({id: 1});
 *
 * // Additionally sets request data (provide it as string or set the content type)
 * // In a RESTful environment this creates a new resource with the given 'id'
 * photo.configureRequest(function(req) {
 *  req.setRequestHeader("Content-Type", "application/json");
 * });
 * photo.put({id: 1}, {title: "Monkey"});
 *
 * // Additionally sets request data (provide it as string or set the content type)
 * // In a RESTful environment this adds a new resource to the resource collection 'photos'
 * photo.configureRequest(function(req) {
 *  req.setRequestHeader("Content-Type", "application/json");
 * });
 * photo.post(null, {title: "Monkey"});
 * </pre>
 *
 * To check for existence of URL parameters or constrain them to a certain format, you
 * can add a <code>check</code> property to the description. See {@link #map} for details.
 *
 * <pre class="javascript">
 * var description = {
 *  "get": { method: "GET", url: "/photo/{id}", check: { id: /\d+/ } }
 * };
 * var photo = new qx.io.rest.Resource(description);
 * // photo.get({id: "FAIL"});
 * // -- Error: "Parameter 'id' is invalid"
 * </pre>
 *
 * If your description happens to use the same action more than once, consider
 * defining another resource.
 *
 * <pre class="javascript">
 * var description = {
 *  "get": { method: "GET", url: "/photos"},
 * };
 * // Distinguish "photo" (singular) and "photos" (plural) resource
 * var photos = new qx.io.rest.Resource(description);
 * photos.get();
 * </pre>
 *
 * Basically, all routes of a resource should point to the same URL (resource in
 * terms of HTTP). One acceptable exception of this constraint are resources where
 * required parameters are part of the URL (<code>/photos/1/</code>) or filter
 * resources. For instance:
 *
 * <pre class="javascript">
 * var description = {
 *  "get": { method: "GET", url: "/photos/{tag}" }
 * };
 * var photos = new qx.io.rest.Resource(description);
 * photos.get();
 * photos.get({tag: "wildlife"})
 * </pre>
 *
 * Strictly speaking, the <code>photos</code> instance represents two distinct resources
 * and could therefore just as well mapped to two distinct resources (for instance,
 * named photos and photosTagged). What style to choose depends on the kind of data
 * returned. For instance, it seems sensible to stick with one resource if the filter
 * only limits the result set (i.e. the individual results have the same properties).
 *
 * In order to respond to successful (or erroneous) invocations of actions,
 * either listen to the generic "success" or "error" event and get the action
 * from the event data, or listen to action specific events defined at runtime.
 * Action specific events follow the pattern "&lt;action&gt;Success" and
 * "&lt;action&gt;Error", e.g. "indexSuccess".
 * 
 * NOTE: Instances of this class must be disposed of after use
 *
 */
qx.Class.define("qx.io.rest.Resource",
{
  extend: qx.core.Object,
  implement : [ qx.core.IDisposable ],

  /**
   * @param description {Map?} Each key of the map is interpreted as
   *  <code>action</code> name. The value associated to the key must be a map
   *  with the properties <code>method</code> and <code>url</code>.
   *  <code>check</code> is optional. Also see {@link #map}.
   *
   * For example:
   *
   * <pre class="javascript">
   * { get: {method: "GET", url: "/photos/{id}", check: { id: /\d+/ }} }
   * </pre>
   *
   * @see qx.bom.rest
   * @see qx.io.rest
   */
  construct: function(description)
  {
    this.base(arguments);

    this.__longPollHandlers = {};
    this.__pollTimers = {};
    this.__routes = {};

    this._resource = this._tailorResource(this._getResource());

    try {
      if (typeof description !== "undefined") {
        if (qx.core.Environment.get("qx.debug")) {
          qx.core.Assert.assertMap(description);
        }
        this.__mapFromDescription(description);
      }
    } catch(e) {
      this.dispose();
      throw e;
    }
  },

  events:
  {
    /**
     * Fired when any request was successful.
     *
     * The action the successful request is associated to, as well as the
     * request itself, can be retrieved from the event’s properties.
     * Additionally, an action specific event is fired that follows the pattern
     * "<action>Success", e.g. "indexSuccess".
     */
    "success": "qx.event.type.Rest",

    /**
     * Fired when request associated to action given in prefix was successful.
     *
     * For example, "indexSuccess" is fired when <code>index()</code> was
     * successful.
     */
    "actionSuccess": "qx.event.type.Rest",

    /**
     * Fired when any request fails.
     *
     * The action the failed request is associated to, as well as the
     * request itself, can be retrieved from the event’s properties.
     * Additionally, an action specific event is fired that follows the pattern
     * "<action>Error", e.g. "indexError".
     */
    "error": "qx.event.type.Rest",

    /**
     * Fired when any request associated to action given in prefix fails.
     *
     * For example, "indexError" is fired when <code>index()</code> failed.
     */
    "actionError": "qx.event.type.Rest"
  },

  statics:
  {
    /**
     * Number of milliseconds below a long-poll request is considered immediate and
     * subject to throttling checks.
     */
    POLL_THROTTLE_LIMIT: 100,

    /**
     * Number of immediate long-poll responses accepted before throttling takes place.
     */
    POLL_THROTTLE_COUNT: 30,

    /**
     * A symbol used in checks to declare required parameter.
     */
    REQUIRED: true,

    /**
     * Get placeholders from URL.
     *
     * @param url {String} The URL to parse for placeholders.
     * @return {Array} Array of placeholders without the placeholder prefix.
     */
    placeholdersFromUrl: function(url) {
      return qx.bom.rest.Resource.placeholdersFromUrl(url);
    }
  },

  members:
  {
    _resource: null,
    __longPollHandlers: null,
    __pollTimers: null,
    __routes: null,

    /**
     * Get resource.
     *
     * May be overridden to change type of resource.
     * @param description {Map?} See construct.
     * @return {qx.bom.rest.Resource} Resource implementation which does the heavy lifting.
     */
    _getResource: function(description) {
      return new qx.bom.rest.Resource(description);
    },

    /**
     * Tailors (apply dependency injection) the given resource to fit our needs.
     *
     * @param resource {qx.bom.rest.Resource} Resource.
     * @return {qx.bom.rest.Resource} Tailored resource.
     */
    _tailorResource: function(resource) {
      // inject different request implementation
      resource.setRequestFactory(this._getRequest);

      // inject different request handling
      resource.setRequestHandler({
          onsuccess: {
            callback: function(req, action) {
              return function() {
                var props = [req.getResponse(), null, false, req, action, req.getPhase()];
                this.fireEvent(action + "Success", qx.event.type.Rest, props);
                this.fireEvent("success", qx.event.type.Rest, props);
              };
            },
            context: this
          },
          onfail: {
            callback: function(req, action) {
              return function() {
                var props = [req.getResponse(), null, false, req, action, req.getPhase()];
                this.fireEvent(action + "Error", qx.event.type.Rest, props);
                this.fireEvent("error", qx.event.type.Rest, props);
              };
            },
            context: this
          },
          onloadend: {
            callback: function(req, action) {
              return function() {
                req.dispose();
              };
            },
            context: this
          }
      });

      return resource;
    },

    //
    // Request
    //

    /**
     * Configure request.
     *
     * @param callback {Function} Function called before request is send.
     *   Receives request, action, params and data.
     *
     * <pre class="javascript">
     * res.configureRequest(function(req, action, params, data) {
     *   if (action === "index") {
     *     req.setAccept("application/json");
     *   }
     * });
     * </pre>
     */
    configureRequest: function(callback) {
      this._resource.configureRequest(callback);
    },

    /**
     * Get request.
     *
     * May be overridden to change type of request.
     * @return {qx.io.request.Xhr} Xhr object
     */
    _getRequest: function() {
      return new qx.io.request.Xhr();
    },

    //
    // Routes and actions
    //

    /**
     * Map action to combination of method and URL pattern.
     *
     * <pre class="javascript">
     *   res.map("get", "GET", "/photos/{id}", {id: /\d+/});
     *
     *   // GET /photos/123
     *   res.get({id: "123"});
     * </pre>
     *
     * @param action {String} Action to associate to request.
     * @param method {String} Method to configure request with.
     * @param url {String} URL to configure request with. May contain positional
     *   parameters (<code>{param}</code>) that are replaced by values given when the action
     *   is invoked. Parameters are optional, unless a check is defined. A default
     *   value can be provided (<code>{param=default}</code>).
     * @param check {Map?} Map defining parameter constraints, where the key is
     *   the URL parameter and the value a regular expression (to match string) or
     *   <code>qx.io.rest.Resource.REQUIRED</code> (to verify existence).
     */
    map: function(action, method, url, check) {
      // add dynamic methods also on ourself to allow 'invoke()' delegation
      this.__addAction(action, method, url, check);

      this._resource.map(action, method, url, check);
    },

    /**
     * Map actions to members.
     *
     * @param action {String} Action to associate to request.
     * @param method {String} Method to configure request with.
     * @param url {String} URL to configure request with. May contain positional
     *   parameters (<code>{param}</code>) that are replaced by values given when the action
     *   is invoked. Parameters are optional, unless a check is defined. A default
     *   value can be provided (<code>{param=default}</code>).
     * @param check {Map?} Map defining parameter constraints, where the key is
     *   the URL parameter and the value a regular expression (to match string) or
     *   <code>qx.io.rest.Resource.REQUIRED</code> (to verify existence).
     */
    __addAction: function(action, method, url, check) {
      this.__routes[action] = [method, url, check];

      // Undefine generic getter when action is named "get"
      if (action == "get") {
        this[action] = undefined;
      }

      // Do not overwrite existing "non-action" methods unless the method is
      // null (i.e. because it exists as a stub for documentation)
      if (typeof this[action] !== "undefined" && this[action] !== null &&
          this[action].action !== true)
      {
        throw new Error("Method with name of action ("+action+") already exists");
      }

      this.__declareEvent(action + "Success");
      this.__declareEvent(action + "Error");

      this[action] = qx.lang.Function.bind(function() {
        Array.prototype.unshift.call(arguments, action);
        return this.invoke.apply(this, arguments);
      }, this);

      // Method is safe to overwrite
      this[action].action = true;

    },

    /**
     * Invoke action with parameters.
     *
     * Internally called by actions dynamically created.
     *
     * May be overridden to customize action and parameter handling.
     *
     * @lint ignoreUnused(successHandler, failHandler, loadEndHandler)
     *
     * @param action {String} Action to invoke.
     * @param params {Map} Map of parameters inserted into URL when a matching
     *  positional parameter is found.
     * @param data {Map|String} Data to be send as part of the request.
     *  See {@link qx.io.request.AbstractRequest#requestData}.
     * @return {Number} Id of the action's invocation.
     */
    invoke: function(action, params, data) {
      var params = (params == null) ? {} : params;

      // Cache parameters
      this.__routes[action].params = params;

      return this._resource.invoke(action, params, data);
    },

    /**
     * Set base URL.
     *
     * The base URL is prepended to the URLs given in the description.
     * Changes affect all future invocations.
     *
     * @param baseUrl {String} Base URL.
     */
    setBaseUrl: function(baseUrl) {
      this._resource.setBaseUrl(baseUrl);
    },

    /**
     * Abort action.
     *
     * Example:
     *
     * <pre class="javascript">
     *   // Abort all invocations of action
     *   res.get({id: 1});
     *   res.get({id: 2});
     *   res.abort("get");
     *
     *   // Abort specific invocation of action (by id)
     *   var actionId = res.get({id: 1});
     *   res.abort(actionId);
     * </pre>
     *
     * @param varargs {String|Number} Action of which all invocations to abort
     *  (when string), or a single invocation of an action to abort (when number)
     */
    abort: function(varargs) {
      this._resource.abort(varargs);
    },

    /**
     * Resend request associated to action.
     *
     * Replays parameters given when action was invoked originally.
     *
     * @param action {String} Action to refresh.
     */
    refresh: function(action) {
      this._resource.refresh(action);
    },

    /**
     * Periodically invoke action.
     *
     * Replays parameters given when action was invoked originally. When the
     * action was not yet invoked and requires parameters, parameters must be
     * given.
     *
     * Please note that IE tends to cache overly aggressive. One work-around is
     * to disable caching on the client side by configuring the request with
     * <code>setCache(false)</code>. If you control the server, a better
     * work-around is to include appropriate headers to explicitly control
     * caching. This way you still avoid requests that can be correctly answered
     * from cache (e.g. when nothing has changed since the last poll). Please
     * refer to <a href="http://www.mnot.net/javascript/xmlhttprequest/cache.html">
     * XMLHttpRequest Caching Test</a> for available options.
     *
     * @lint ignoreUnused(intervalListener)
     *
     * @param action {String} Action to poll.
     * @param interval {Number} Interval in ms.
     * @param params {Map?} Map of parameters. See {@link #invoke}.
     * @param immediately {Boolean?false} <code>true</code>, if the poll should
     *   invoke a call immediately.
     * @return {qx.event.Timer} Timer that periodically invokes action. Use to
     *   stop or resume. Is automatically disposed on disposal of object.
     */
    poll: function(action, interval, params, immediately) {
      // Dispose timer previously created for action
      if (this.__pollTimers[action]) {
        this.__pollTimers[action].dispose();
      }

      // Fallback to previous params
      if (typeof params == "undefined") {
        params = this.__routes[action].params;
      }

      // Invoke immediately
      if (immediately) {
        this.invoke(action, params);
      }

      var intervalListener = function() {
        var reqs = this.getRequestsByAction(action),
            req = (reqs) ? reqs[0] : null;

        if (!immediately && !req) {
          this.invoke(action, params);
          return;
        }
        if (req && (req.isDone() || req.isDisposed())) {
          this.refresh(action);
        }
      };

      var timer = this.__pollTimers[action] = new qx.event.Timer(interval);
      timer.addListener("interval", intervalListener, this._resource);
      timer.start();
      return timer;
    },

    /**
     * Long-poll action.
     *
     * Use Ajax long-polling to continuously fetch a resource as soon as the
     * server signals new data. The server determines when new data is available,
     * while the client keeps open a request. Requires configuration on the
     * server side. Basically, the server must not close a connection until
     * new data is available. For a high level introduction to long-polling,
     * refer to <a href="http://en.wikipedia.org/wiki/Comet_(programming)#Ajax_with_long_polling">
     * Ajax with long polling</a>.
     *
     * Uses {@link #refresh} internally. Make sure you understand the
     * implications of IE's tendency to cache overly aggressive.
     *
     * Note no interval is given on the client side.
     *
     * @lint ignoreUnused(longPollHandler)
     *
     * @param action {String} Action to poll.
     * @return {String} Id of handler responsible for long-polling. To stop
     *  polling, remove handler using {@link qx.core.Object#removeListenerById}.
     */
    longPoll: function(action) {
      var res = this,
          lastResponse,               // Keep track of last response
          immediateResponseCount = 0; // Count immediate responses

      // Throttle to prevent high load on server and client
      function throttle() {
        var isImmediateResponse =
          lastResponse &&
          ((new Date()) - lastResponse) < res._getThrottleLimit();

        if (isImmediateResponse) {
          immediateResponseCount += 1;
          if (immediateResponseCount > res._getThrottleCount()) {
            if (qx.core.Environment.get("qx.debug")) {
              res.debug("Received successful response more than " +
                res._getThrottleCount() + " times subsequently, each within " +
                res._getThrottleLimit() + " ms. Throttling.");
            }
            return true;
          }
        }

        // Reset counter on delayed response
        if (!isImmediateResponse) {
          immediateResponseCount = 0;
        }

        return false;
      }

      var handlerId = this.__longPollHandlers[action] =
        this.addListener(action + "Success", function longPollHandler() {
          if (res.isDisposed()) {
            return;
          }

          if (!throttle()) {
            lastResponse = new Date();
            res.refresh(action);
          }
        });

      this.invoke(action);
      return handlerId;
    },

    /**
     * Get request configuration for action and parameters.
     *
     * This is were placeholders are replaced with parameters.
     *
     * @param action {String} Action associated to request.
     * @param params {Map} Parameters to embed in request.
     * @return {Map} Map of configuration settings. Has the properties
     *   <code>method</code>, <code>url</code> and <code>check</code>.
     */
    _getRequestConfig: function(action, params) {
      return this._resource._getRequestConfig(action, params);
    },

    /**
     * Override to adjust the throttle limit.
     * @return {Integer} Throttle limit in milliseconds
     */
    _getThrottleLimit: function() {
      return qx.io.rest.Resource.POLL_THROTTLE_LIMIT;
    },

    /**
     * Override to adjust the throttle count.
     * @return {Integer} Throttle count
     */
    _getThrottleCount: function() {
      return qx.io.rest.Resource.POLL_THROTTLE_COUNT;
    },

    /**
     * Map actions from description.
     *
     * Allows to decoratively define routes.
     *
     * @param description {Map} Map that defines the routes.
     */
    __mapFromDescription: function(description) {
      Object.keys(description).forEach(function(action) {
        var route = description[action],
            method = route.method,
            url = route.url,
            check = route.check;

        if (qx.core.Environment.get("qx.debug")) {
          qx.core.Assert.assertString(method, "Method must be string for route '" + action + "'");
          qx.core.Assert.assertString(url, "URL must be string for route '" + action + "'");
        }

        this.map(action, method, url, check);
      }, this);
    },

    /**
     * Declare event at runtime.
     *
     * @param type {String} Type of event.
     */
    __declareEvent: function(type) {
      if (!this.constructor.$$events) {
        this.constructor.$$events = {};
      }

      if (!this.constructor.$$events[type]) {
        this.constructor.$$events[type] = "qx.event.type.Rest";
      }
    }
  },

  /**
   * Destructs the Resource.
   *
   * All created requests, routes and pollTimers will be disposed.
   */
  destruct: function() {
    var action;

    if (this.__pollTimers) {
      for (action in this.__pollTimers) {
        var timer = this.__pollTimers[action];
        timer.stop();
        timer.dispose();
      }
    }

    if (this.__longPollHandlers) {
      for (action in this.__longPollHandlers) {
        var id = this.__longPollHandlers[action];
        this.removeListenerById(id);
      }
    }

    this._resource.destruct();
    this._resource = this.__routes = this.__pollTimers = this.__longPollHandlers = null;
  }
});
