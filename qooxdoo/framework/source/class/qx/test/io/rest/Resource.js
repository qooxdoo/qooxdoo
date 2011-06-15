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
      this.res = new qx.io.rest.Resource();
      this.setUpDoubleRequest();
    },

    setUpDoubleRequest : function() {
      var req = this.req = new qx.io.request.Xhr(),
          res = this.res;

      // Stub request methods, leave event system intact
      req = this.shallowStub(req, qx.io.request.AbstractRequest);

      // Inject double and return
      this.stub(res, "_getRequest").returns(req);
      return req;
    },

    tearDown: function() {
      this.res.dispose();
      this.getSandbox().restore();
    },

    //
    // Route
    //

    "test: route action": function() {
      var res = this.res,
          params;

      res.route("GET", "/photos", "index");
      params = res._getRequestParams("index");

      this.assertEquals("GET", params[0]);
      this.assertEquals("/photos", params[1]);
    },

    "test: route action dynamically creates action": function() {
      var res = this.res,
          req = this.req;

      res.route("GET", "/photos", "index");
      this.assertFunction(res.index);
    },

    "test: route action throws when existing action": function() {
      var res = this.res,
          req = this.req;

      // For whatever reason
      res.index = function() {};

      this.assertException(function() {
        res.route("GET", "/photos", "index");
      }, Error);
    },

    "test: dynamically created action is chainable": function() {
      var res = this.res,
          req = this.req;

      res.route("GET", "/photos", "index");
      this.assertEquals(res, res.index(), "Must return itself");
    },

    //
    // Invoke
    //

    "test: invoke action": function() {
      var res = this.res,
          req = this.req,
          result;

      res.route("GET", "/photos", "index");
      result = res._invoke("index");

      this.assertCalledWith(req.setMethod, "GET");
      this.assertCalledWith(req.setUrl, "/photos");
      this.assertCalled(req.send);
    },

    "test: invoke dynamically created action": function() {
      var res = this.res,
          req = this.req;

      res.route("GET", "/photos", "index");
      res.index();

      this.assertCalledWith(req.setMethod, "GET");
      this.assertCalledWith(req.setUrl, "/photos");
      this.assertCalled(req.send);
    },

    "test: fire actionSuccess with response": function() {
      var res = this.res,
          that = this;

      res.route("GET", "/photos", "index");
      res._invoke("index");
      res.assertEventFired(res, "indexSuccess", function() {
        that.respond("Affe");
      }, function(e) {
        that.assertEquals("Affe", e.getData());
      });
    },

    skip: function(msg) {
      throw new qx.dev.unit.RequirementError(null, msg);
    },

    // Fake response
    respond: function(response) {
      var req = this.req;
      response = response || "";
      req.getResponse.returns(response);
      req.fireEvent("success");
    }

  }
});
