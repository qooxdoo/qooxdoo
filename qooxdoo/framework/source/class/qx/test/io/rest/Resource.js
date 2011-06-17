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

/* ************************************************************************

#asset(qx/test/xmlhttp/*)

************************************************************************ */

qx.Class.define("qx.test.io.rest.Resource",
{
  extend: qx.dev.unit.TestCase,

  include : [qx.dev.unit.MRequirements,
             qx.dev.unit.MMock],

  members:
  {
    setUp: function() {
      this.setUpDoubleRequest();
      var res = this.res = new qx.io.rest.Resource();

      // Default route
      res.map("GET", "/photos", "index");

      // Need to set up double request explicitly
      qx.io.request.Xhr.restore();
    },

    setUpDoubleRequest : function() {
      var req = this.req = new qx.io.request.Xhr(),
          res = this.res;

      // Stub request methods, leave event system intact
      req = this.shallowStub(req, qx.io.request.AbstractRequest);

      // Inject double and return
      this.injectStub(qx.io.request, "Xhr", req);
      return req;
    },

    tearDown: function() {
      this.res.dispose();
      this.getSandbox().restore();
    },

    //
    // Configuration
    //

    "test: configure request": function() {
      var res = this.res,
          req = this.req,
          msg,
          callback;

      callback = this.spy(qx.lang.Function.bind(function(req) {
        this.assertIdentical(this.req, req, msg);
      }, this));

      msg = "Instantiation";
      res.configureRequest(callback);

      msg = "Map";
      res.configureRequest(callback);

      msg = "Invoke #1";
      res.index();
      res.configureRequest(callback);

      // Setup new double and update request to assert identity of
      req = this.setUpDoubleRequest();

      msg = "Invoke #2";
      res.index();
      res.configureRequest(callback);

      this.assertCalled(callback, "Must call configuration callback");
    },

    "test: configure request to accept": function() {
      var res = this.res,
          req = this.req;

      res.configureRequest(function(req) {
        req.setAccept("application/json");
      });

      res.index();
      this.assertCalledWith(req.setAccept, "application/json");
    },

    "test: configure request for individual action": function() {
      var res = this.res,
          req = this.req,
          callback;

      callback = this.spy(qx.lang.Function.bind(function(req, action) {
        this.assertEquals("index", action);
      }, this));
      res.configureRequest(callback);

      res.index();
      this.assertCalled(callback, "Must call configuration callback");
    },

    //
    // Route
    //

    "test: map action": function() {
      var res = this.res,
          params;

      params = res._getRequestParams("index");

      this.assertEquals("GET", params[0]);
      this.assertEquals("/photos", params[1]);
    },

    "test: mapping action creates method": function() {
      var res = this.res,
          req = this.req;

      this.assertFunction(res.index);
    },

    "test: mapping action throws when existing method": function() {
      var res = this.res,
          req = this.req;

      // For whatever reason
      res.current = function() {};

      this.assertException(function() {
        res.map("GET", "/photos/current", "current");
      }, Error);
    },

    "test: dynamically created method is chainable": function() {
      var res = this.res,
          req = this.req;

      this.assertEquals(res, res.index(), "Must return itself");
    },

    //
    // Invoke
    //

    "test: invoke action generically": function() {
      var res = this.res,
          req = this.req,
          result;

      result = res._invoke("index");

      this.assertCalledWith(req.setMethod, "GET");
      this.assertCalledWith(req.setUrl, "/photos");
      this.assertCalled(req.send);
    },

    "test: invoke action": function() {
      var res = this.res,
          req = this.req;

      res.index();

      this.assertCalledWith(req.setMethod, "GET");
      this.assertCalledWith(req.setUrl, "/photos");
      this.assertCalled(req.send);
    },

    "test: fire actionSuccess": function() {
      var res = this.res,
          req = this.req,
          that = this;

      res.index();
      this.assertEventFired(res, "indexSuccess", function() {
        that.respond("Affe");
      }, function(e) {
        that.assertEquals("Affe", e.getData());
        that.assertEquals("index", e.getAction());
        that.assertIdentical(req, e.getRequest());
      });
    },

    "test: fire actionError": function() {
      var res = this.res,
          req = this.req,
          that = this;

      res.index();
      this.assertEventFired(res, "indexError", function() {
        that.respondError("statusError");
      }, function(e) {
        that.assertEquals("statusError", e.getPhase());
        that.assertIdentical(req, e.getRequest());
      });
    },

    "test: fire error": function() {
      var res = this.res,
          req = this.req,
          that = this;

      res.index();
      this.assertEventFired(res, "error", function() {
        that.respondError("statusError");
      }, function(e) {
        that.assertEquals("statusError", e.getPhase());
        that.assertIdentical(req, e.getRequest());
      });
    },

    skip: function(msg) {
      throw new qx.dev.unit.RequirementError(null, msg);
    },

    // Fake response
    respond: function(response) {
      var req = this.req;
      response = response || "";
      req.getPhase.returns("success");
      req.getResponse.returns(response);
      req.fireEvent("success");
    },

    // Fake erroneous response
    respondError: function(phase) {
      var req = this.req;
      phase = phase || "statusError";
      req.getPhase.returns(phase);
      req.fireEvent("fail");
    }

  }
});
