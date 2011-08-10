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
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Client-side wrapper of a REST resource.
 *
 * Each instance represents a resource in terms of REST. A number of actions
 * unique to the resource can be defined and invoked. A resource with its
 * actions is configured declaratively by passing a resource description to
 * the constructor, or programatically using {@link #map}.
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
 * route, is passed the parameters and finally send. What kind of request is send
 * can be configured by overwriting {@link #_getRequest}.
 *
 * In order to respond to successful (or erroneous) invocations of actions,
 * either listen to the generic "success" or "error" event and get the action
 * from the event data, or listen to action specific events defined at runtime.
 * Action specific events follow the pattern "<action>Success" and
 * "<action>Error", e.g. "indexSuccess".
 */
qx.Class.define("qx.io.rest.Resource",
{
  extend : qx.core.Object,

  /**
   * @param description {Map?} Each key of the map is interpreted as
   *  <code>action</code> name. The value associated to the key must be a map
   *  with the properties <code>method</code> and <code>url</code>.
   *  <code>check</code> is optional. Also see {@link #map}.
   *
   * For example:
   *
   * <pre lang="javascript">
   * { show: {method: "GET", url: "/photos/:id", check: /\d+/} }
   * </pre>
   */
  construct: function(description)
  {
    this.base(arguments);

    this.__routes = {};
    this.__pollTimers = {};
    this.__longPollHandlers = {};
    this.__invoked = {};

    this.__createRequest();

    try {
      if (typeof description !== "undefined") {
        qx.core.Assert.assertMap(description);
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
     * Fired when request associated to action was successful.
     *
     * Additionally, action specific events are fired that follow the pattern
     * "<action>Success", e.g. "indexSuccess".
     */
    "success": "qx.event.type.Rest",

    /**
     * Fired when request associated to action fails.
     *
     * Additionally, action specific events are fired that follow the pattern
     * "<action>Error", e.g. "indexError".
     */
    "error": "qx.event.type.Rest"
  },

  statics:
  {
    /**
     * Number of milliseconds below a request is considered immediate and
     * subject to throttling checks.
     */
    POLL_THROTTLE_LIMIT: 100,

    /**
     * Number of immediate responses accepted before throttling takes place.
     */
    POLL_THROTTLE_COUNT: 30
  },

  members:
  {
    __routes: null,
    __request: null,
    __invoked: null,
    __pollTimers: null,
    __longPollHandlers: null,
    __configureRequestCallback: null,

    //
    // Request
    //

    /**
     * Configure request.
     *
     * @param callback {Function} Function called before request is send.
     *   Receives pre-configured request and action.
     *
     * <pre class="javascript">
     * req.setConfigureRequest(function(req, action) {
     *   if (action === "index") {
     *     req.setAccept("application/json");
     *   }
     * });
     * </pre>
     */
    configureRequest: function(callback) {
      this.__configureRequestCallback = callback;
    },

    /**
     * Get request.
     *
     * May be overriden to change type of request.
     */
    _getRequest: function() {
      return new qx.io.request.Xhr();
    },

    /**
     * Create request.
     */
    __createRequest: function() {
      if (this.__request) {
        this.__request.dispose();
      }

      this.__request = this._getRequest();
      return this.__request;
    },

    //
    // Routes and actions
    //

    /**
     * Map action to combination of method and URL pattern.
     *
     * <pre class="javascript">
     *   res.map("show", "GET", "/photos/:id", {id: /\d+/});
     *
     *   // GET /photos/123
     *   res.show({id: "123"});
     * </pre>
     *
     * @param action {String} Action to associate to request.
     * @param method {String} Method to configure request with.
     * @param url {String} URL to configure request with. May contain positional
     *   parameters (:param) that are replaced by values given when the action
     *   is invoked.
     * @param check {Map?} Map defining parameter constraints, where the key is
     *   the parameter and the value a regular expression.
     */
    map: function(action, method, url, check) {
      this.__routes[action] = [method, url, check];

      if (typeof this[action] !== "undefined") {
        throw new Error("Method with name of action (" +
          action + ") already exists");
      }

      this.__declareEvent(action + "Success");
      this.__declareEvent(action + "Error");

      this[action] = qx.lang.Function.bind(function(params) {
        this._invoke(action, params);
        return this;
      }, this);
    },

    /**
     * Invoke action with parameters.
     *
     * Internally called by actions dynamically created.
     *
     * May be overriden to customize action and parameter handling.
     *
     * @lint ignoreUnused(successHandler, failHandler)
     *
     * @param action {String} Action to invoke.
     * @param params {Map} Map of parameters to be send as part of the request,
     *  where the key is the parameter to match and the value a string. Inserted
     *  into URL when a matching positional parameter is found.
     */
    _invoke: function(action, params) {
      var req = this.__request,
          config = this._getRequestConfig(action, params),
          method = config.method,
          url = config.url,
          check = config.check,
          requestData;

      if(typeof check !== "undefined") {
        qx.core.Assert.assertObject(check, "Check must be object with params as keys");
        qx.lang.Object.getKeys(check).forEach(function(key) {
          if (!check[key].test(params[key])) {
            throw new Error("Parameter " + key + " is invalid");
          }
        });
      }

      // Cache parameters
      this.__routes[action].params = params;

      // Create new request when invoked before
      if (this.__invoked && this.__invoked[action]) {
        req = this.__createRequest();
      }

      // Remove positional parameters from request data (already in URL)
      if (params) {
        requestData = qx.lang.Object.clone(params);
        this.__placeholdersFromUrl(this.__routes[action][1]).forEach(function(placeholder) {
          delete requestData[placeholder];
        });
      }

      // Configure request
      req.set({method: method, url: url});
      if (requestData) {
        req.setRequestData(requestData);
      }
      if (this.__configureRequestCallback) {
        this.__configureRequestCallback.call(this, req, action);
      }

      // Handle successful request
      req.addListenerOnce("success", function successHandler() {
        var props = [req.getResponse(), null, false, req, action, req.getPhase()];
        this.fireEvent(action + "Success", qx.event.type.Rest, props);
        this.fireEvent("success", qx.event.type.Rest, props);
      }, this);

      // Handle erroneous request
      req.addListenerOnce("fail", function failHandler() {
        var props = [req.getResponse(), null, false, req, action, req.getPhase()];
        this.fireEvent(action + "Error", qx.event.type.Rest, props);
        this.fireEvent("error", qx.event.type.Rest, props);
      }, this);

      req.send();
      this.__invoked[action] = true;
    },

    /**
     * Resend request associated to action.
     *
     * Replays parameters given when action was invoked originally.
     *
     * @param action {String} Action to refresh.
     */
    refresh: function(action) {
      this._invoke(action, this.__routes[action].params);
    },

    /**
     * Periodically invoke action.
     *
     * Replays parameters given when action was invoked originally. When the
     * action was not yet invoked and requires parameters, parameters must be
     * given.
     *
     * Please note that IE tends to cache overly agressive. One work-around is
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
     * @param params {Map?} Map of parameters. See {@link #_invoke}.
     * @return {qx.event.Timer} Timer that periodically invokes action. Use to
     *  stop or resume. Is automatically disposed on disposal of object.
     */
    poll: function(action, interval, params) {
      // Dispose timer previously created for action
      if (this.__pollTimers[action]) {
        this.__pollTimers[action].dispose();
      }

      // Cache parameters
      if (params) {
        this.__routes[action].params = params;
      }

      // Refresh immediately
      this.refresh(action);

      var timer = this.__pollTimers[action] = new qx.event.Timer(interval);
      timer.addListener("interval", function intervalListener() {
        this.refresh(action);
      }, this);
      timer.start();

      return timer;
    },

    /**
     * Long-poll action.
     *
     * Use Ajax long-polling to continously fetch a resource as soon as the
     * server signals new data. The server determines when new data is available,
     * while the client keeps open a request. Requires configuration on the
     * server side. Basically, the server must not close a connection until
     * new data is available. For a high level introduction to long-polling,
     * refer to <a href="http://en.wikipedia.org/wiki/Comet_(programming)#Ajax_with_long_polling">
     * Ajax with long polling</a>.
     *
     * Uses {@link #refresh} internally. Make sure you understand the
     * implications of IE's tendency to cache overly agressive.
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
          context = true,             // Work-around disposed context warning
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
        },
      context);

      this._invoke(action);
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
      var route = this.__routes[action];

      if (!qx.lang.Type.isArray(route)) {
        throw new Error("No route for action " + action);
      }

      var method = route[0],
          url = route[1],
          check = route[2],
          placeholders = this.__placeholdersFromUrl(url);

      params = params || {};

      placeholders.forEach(function(placeholder) {
        // Require parameter for each placeholder
        if (typeof (params[placeholder]) === "undefined") {
          throw new Error("Missing parameter '" + placeholder + "'");
        }

        // Replace placeholder with parameter
        var re = new RegExp(":" + placeholder);
        url = url.replace(re, params[placeholder]);
      });

      return {method: method, url: url, check: check};
    },

    /**
     * Override to adjust the throttle limit.
     */
    _getThrottleLimit: function() {
      return qx.io.rest.Resource.POLL_THROTTLE_LIMIT;
    },

    /**
     * Override to adjust the throttle count.
     */
    _getThrottleCount: function() {
      return qx.io.rest.Resource.POLL_THROTTLE_COUNT;
    },

    /**
     * Get placeholders from URL.
     *
     * @param url {String} The URL to parse for placeholders.
     * @return {Array} Array of placeholders without the placeholder prefix.
     */
    __placeholdersFromUrl: function(url) {
      var placeholderRe = /:(\w+)/g,
          match,
          placeholders = [],
          parsedUri = qx.util.Uri.parseUri(url);

      // Not confuse port with placeholder
      if (parsedUri.port && parsedUri.relative) {
        url = parsedUri.relative;
      }

      // With g flag set, searching begins at the regex object's
      // lastIndex, which is zero initially and increments with each match.
      while ((match = placeholderRe.exec(url))) {
        placeholders.push(match[1]);
      }

      return placeholders;
    },

    /**
     * Map actions from description.
     *
     * Allows to decoratively define routes.
     *
     * @param description {Map} Map that defines the routes.
     */
    __mapFromDescription: function(description) {
      qx.lang.Object.getKeys(description).forEach(function(action) {
        var route = description[action],
            method = route.method,
            url = route.url,
            check = route.check;

        qx.core.Assert.assertString(method, "Method must be string for route '" + action + "'");
        qx.core.Assert.assertString(url, "URL must be string for route '" + action + "'");

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

  destruct: function() {
    this.__request && this.__request.dispose();

    if (this.__pollTimers) {
      qx.lang.Object.getKeys(this.__pollTimers).forEach(function(key) {
        var timer = this.__pollTimers[key];
        timer.stop();
        timer.dispose();
      }, this);
    }

    if (this.__longPollHandlers) {
      qx.lang.Object.getKeys(this.__longPollHandlers).forEach(function(key) {
        var id = this.__longPollHandlers[key];
        this.removeListenerById(id);
      }, this);
    }

    this.__routes = this.__pollTimers = this.__invoked = null;
  }
});
