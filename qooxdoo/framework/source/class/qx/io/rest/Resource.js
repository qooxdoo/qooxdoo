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
 * Client-side wrapper of a REST resource.
 *
 * Each instance represents a resource in terms of REST. A number of actions
 * unique to the resource can be defined and invoked. A resource with it's
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
 * In order to respond to successfull (or erroneous) invocations of actions,
 * either listen to the generic "success" or "error" event and get the action
 * from the event data, or listen to action specific events defined at runtime.
 * Action specific events follow the pattern "<action>Success" and
 * "<action>Error", e.g. "indexSuccess".
 */
qx.Class.define("qx.io.rest.Resource",
{
  extend : qx.core.Object,

  /**
   * @param description {[]?} Array of maps. Each map describes a
   *   route and must have the properties <code>action</code>,<code>method</code>,
   *   <code>url</code>. <code>check</code> is optional.
   */
  construct: function(description)
  {
    this.base(arguments);

    this.__createRequest();
    this.__routes = {};
    this.__pollTimers = {};
    this.__invoked = {};

    if (typeof description !== "undefined") {
      qx.core.Assert.assertArray(description);
      this.__mapFromDescription(description);
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

  members:
  {
    __routes: null,
    __request: null,
    __invoked: null,
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
     * @param check {Map?} Map defining parameter constraints,where the key is
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
     * @param action {String} Action to invoke.
     * @param params {Map} Map of parameters to be send as part of the request.
     *   Inserted into URL when a matching positional parameter is found.
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
      req.addListener("success", function() {
        var props = [req.getResponse(), null, false, req, action, req.getPhase()];
        this.fireEvent(action + "Success", qx.event.type.Rest, props);
        this.fireEvent("success", qx.event.type.Rest, props);
      }, this);

      // Handle erroneous request
      req.addListener("fail", function() {
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
     * @param action {String} Action to poll.
     * @param interval {Number} Interval in ms.
     * @param params {Map?} Map of parameters. See {@link #_invoke}.
     */
    poll: function(action, interval, params) {
      // Cache parameters
      if (params) {
        this.__routes[action].params = params;
      }

      // Refresh immediately
      this.refresh(action);

      var timer = this.__pollTimers[action] = new qx.event.Timer(interval);
      timer.addListener("interval", function() {
        this.refresh(action);
      }, this);
      timer.start();
    },

    /**
     * End polling of action.
     *
     * @param action {String} Action for which to end polling.
     */
    endPoll: function(action) {
      if (this.__pollTimers[action]) {
        this.__pollTimers[action].stop();
      }
    },

    /**
     * Resume polling of action that was previously stopped.
     *
     * @param action {String} Action for which to resume polling.
     */
    resumePoll: function(action) {
      if (this.__pollTimers[action]) {
        this.__pollTimers[action].start();
      }
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
        if (!params[placeholder]) {
          throw new Error("Missing parameter '" + placeholder + "'");
        }

        // Replace placeholder with parameter
        var re = new RegExp(":" + placeholder);
        url = url.replace(re, params[placeholder]);
      });

      return {method: method, url: url, check: check};
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
     * Map actions from description. Allows to decoratively define maps.
     *
     * @param description {[Map]?} Array of maps. Each map describes a
     *   route and must have the properties <code>action</code>,<code>method</code>,
     *   <code>url</code>. <code>check</code> is optional.
     */
    __mapFromDescription: function(description) {
      description.forEach(function(route, index) {
        var method = route["method"],
            url = route["url"],
            action = route["action"],
            check = route["check"];

        qx.core.Assert.assertString(method, "Method must be string for route #" + index);
        qx.core.Assert.assertString(url, "Url must be string for route #" + index);
        qx.core.Assert.assertString(action, "Action must be string for route #" + index);

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
    if (this.__pollTimers) {
      qx.lang.Object.getKeys(this.__pollTimers).forEach(function(key) {
        var timer = this.__pollTimers[key];
        timer.stop();
        timer.dispose();
      }, this);
    }

    this.__routes = this.__pollTimers = this.__invoked = null;

    this._disposeObjects(this.__request);
  }
});
