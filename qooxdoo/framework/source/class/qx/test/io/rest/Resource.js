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

      // Default routes
      res.map("index", "GET", "/photos");
      res.map("current", "GET", "/photos/current");

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

    "test: map action creates method": function() {
      var res = this.res,
          req = this.req;

      this.assertFunction(res.index);
    },

    "test: map action throws when existing method": function() {
      var res = this.res,
          req = this.req;

      // For whatever reason
      res.popular = function() {};

      this.assertException(function() {
        res.map("popular", "GET", "/photos/popular");
      }, Error);
    },

    "test: dynamically created method is chainable": function() {
      var res = this.res,
          req = this.req;

      this.assertEquals(res, res.index(), "Must return itself");
    },

    "test: map actions from description": function() {
      var req = this.req,
          description,
          res,
          check = {},
          params;

      description = [
        {
          action: "index",
          method: "GET",
          url: "/photos"
        },
        {
          action: "create",
          method: "POST",
          url: "/photos",
          check: check
        }
      ];

      res = this.res = new qx.io.rest.Resource(description);

      params = res._getRequestParams("index");
      this.assertArrayEquals(["GET", "/photos", undefined], params);

      params = res._getRequestParams("create");
      this.assertArrayEquals(["POST", "/photos", check], params);
    },

    "test: map action from description throws with non-array": function() {
      this.assertException(function() {
        this.res = new qx.io.rest.Resource({});
      });
    },

    "test: map action from description throws with incomplete route": function() {
      this.assertException(function() {
        var description = [
          {method: "GET", url: "/photos", action: "index"},
          {method: "GET", action: "show"}
        ];
        this.res = new qx.io.rest.Resource(description);
      }, Error, "Url must be string for route #1");
    },

    //
    // Invoke
    //

    "test: invoke action generically": function() {
      var res = this.res,
          req = this.req,
          result;

      result = res._invoke("index");

      this.assertSend();
    },

    "test: invoke action": function() {
      var res = this.res,
          req = this.req;

      res.index();

      this.assertSend();
    },

    "test: invoke action with positional params": function() {
      var res = this.res,
          req = this.req;

      res.map("show", "GET", "/photos/:id");
      res.show({id: "1"});

      this.assertCalledWith(req.setUrl, "/photos/1");
    },

    "test: invoke action with multiple positional params": function() {
      var res = this.res,
          req = this.req;

      res.map("showComments", "GET", "/photos/:id/comments/:commentId");
      res.showComments({id: "1", commentId: "2"});

      this.assertCalledWith(req.setUrl, "/photos/1/comments/2");
    },

    "test: invoke action with positional params in query": function() {
      var res = this.res,
          req = this.req;

      res.map("showComments", "GET", "/photos/:id/comments?id=:commentId");
      res.showComments({id: "1", commentId: "2"});

      this.assertCalledWith(req.setUrl, "/photos/1/comments?id=2");
    },

    "test: invoke action for url with port": function() {
      var res = this.res,
          req = this.req;

      res.map("show", "GET", "http://example.com:8080/photos/:id");
      res.show({id: "1"});

      this.assertCalledWith(req.setUrl, "http://example.com:8080/photos/1");
    },

    "test: invoke action for relative url": function() {
      var res = this.res,
          req = this.req;

      res.map("show", "GET", ":page");
      res.show({page: "index"});
      this.assertCalledWith(req.setUrl, "index");
    },

    "test: invoke action for relative url with dots": function() {
      var res = this.res,
          req = this.req;

      res.map("showParent", "GET", "../:page");
      res.showParent({page: "index"});
      this.assertCalledWith(req.setUrl, "../index");
    },

    "test: invoke action for route with check": function() {
      var res = this.res;

      res.map("zoom", "GET", "/photos/zoom/:id", {id: /\d+/});
      res.zoom({id: "123"});

      this.assertSend("GET", "/photos/zoom/123");
    },

    "test: invoke action throws when missing positional param": function() {
      var res = this.res,
          params;

      res.map("photoComments", "GET", "/photos/:photoId/comments/:id");
      this.assertException(function() {
        res.photoComments({photoId: "1"});
      }, Error, "Missing parameter 'id'");
    },

    "test: invoke action throws when param not match check": function() {
      var res = this.res;

      res.map("zoom", "GET", "/photos/zoom/:id", {id: /\d+/});
      this.assertException(function() {
        res.zoom({id: "FAIL"});
      }, Error, "Parameter id is invalid");
    },

    //
    // Helper
    //

    "test: refresh action": function() {
      var res = this.res,
          req = this.req;

      res.index();
      this.assertSend();

      req = this.setUpDoubleRequest();
      res.refresh("index");
      this.assertSend();
    },

    "test: refresh action replaying previous params": function() {
      var res = this.res,
          req = this.req;

      res.map("show", "GET", "/photos/:id");
      res.show({id: "1"});
      this.assertSend("GET", "/photos/1");

      req = this.setUpDoubleRequest();
      res.refresh("show");
      this.assertSend("GET", "/photos/1");
    },

    "test: poll action": function() {
      var res = this.res,
          sandbox = this.getSandbox();

      sandbox.useFakeTimers();
      this.stub(res, "refresh");

      res.poll("index", 10);
      sandbox.clock.tick(100);
      this.assertCalledWith(res.refresh, "index");

      // 11 = 1 (initial) + 10 (tick)
      this.assert(res.refresh.callCount == 11,
        "Must be called 10 times but was " + res.refresh.callCount  + " times");
    },

    "test: poll action immediately": function() {
      var res = this.res;

      this.stub(res, "refresh");
      res.poll("index", 10);
      this.assertCalled(res.refresh);
    },

    "test: poll action sets initial params": function() {
      var res = this.res;

      res.map("show", "GET", "/photos/:id");
      this.stub(res, "_invoke");

      res.poll("show", 10, {id: "1"});
      this.assertCalledWith(res._invoke, "show", {id: "1"});
    },

    "test: poll action replaying previous params": function() {
      var res = this.res,
          req = this.req;

      res.map("show", "GET", "/photos/:id");
      res.show({id: "1"});
      this.assertSend("GET", "/photos/1");

      req = this.setUpDoubleRequest();
      res.poll("show");
      this.assertSend("GET", "/photos/1");
    },

    "test: poll many actions": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          stub,
          index,
          current;

      sandbox.useFakeTimers();

      stub = this.stub(res, "refresh");
      index = stub.withArgs("index");
      current = stub.withArgs("current");

      res.poll("index", 10);
      res.poll("current", 10);

      sandbox.clock.tick(10);
      this.assert(index.callCount == 2,
        "Action index must be called 2 times but was " + res.refresh.callCount  + " times");
      this.assert(current.callCount == 2,
        "Action index must be called 2 times but was " + res.refresh.callCount  + " times");
    },

    "test: end poll action": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          numCalled;

      sandbox.useFakeTimers();

      this.stub(res, "refresh");
      res.poll("index", 10);

      sandbox.clock.tick(10);
      numCalled = res.refresh.callCount;

      res.endPoll("index");

      sandbox.clock.tick(100);
      this.assertEquals(numCalled, res.refresh.callCount,
        "Must not refresh after endPoll");
    },

    "test: end poll action does not end polling of other action": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          numCalled,
          stub;

      sandbox.useFakeTimers();

      res.map("other", "GET", "/photos/other");

      stub = this.stub(res, "refresh").withArgs("other");
      res.poll("index", 10);
      res.poll("other", 10);

      sandbox.clock.tick(10);
      numCalled = stub.callCount;
      res.endPoll("index");

      sandbox.clock.tick(100);
      this.assert(stub.callCount > numCalled, "Must not end poll stub");
    },

    "test: resume poll action": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          stub,
          callCount;

      sandbox.useFakeTimers();
      stub = this.stub(res, "refresh");

      res.poll("index", 10);
      sandbox.clock.tick(10);
      callCount = stub.callCount;
      res.endPoll("index");

      res.resumePoll("index");
      sandbox.clock.tick(10);
      this.assert(stub.callCount > callCount, "Must resume poll after end");
    },

    "test: handle end poll unknown action gracefully": function() {
      this.res.endPoll("unknown");
    },

    "test: handle resume poll unknown action gracefully": function() {
      this.res.resumePoll("unknown");
    },

    //
    // Events
    //

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

    assertSend: function(method, url) {
      var req = this.req;

      method = method || "GET";
      url = url || "/photos";

      this.assertCalledWith(req.setMethod, method);
      this.assertCalledWith(req.setUrl, url);
      this.assertCalled(req.send);
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
