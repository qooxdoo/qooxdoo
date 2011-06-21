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

qx.Class.define("qx.io.rest.Resource",
{
  extend : qx.core.Object,

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
    "success": "qx.event.type.Rest",
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

    configureRequest: function(callback) {
      this.__configureRequestCallback = callback;
    },

    _getRequest: function() {
      return new qx.io.request.Xhr();
    },

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

    _invoke: function(action, params) {
      var req = this.__request,
          config = this._getRequestConfig(action, params),
          method = config.method,
          url = config.url,
          check = config.check;

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

      // Set method and URL
      req.set({method: method, url: url});

      // Configure request
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

    refresh: function(action) {
      this._invoke(action, this.__routes[action].params);
    },

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

    endPoll: function(action) {
      if (this.__pollTimers[action]) {
        this.__pollTimers[action].stop();
      }
    },

    resumePoll: function(action) {
      if (this.__pollTimers[action]) {
        this.__pollTimers[action].start();
      }
    },

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
