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
      this.setUpResource();

      // Need to set up double request explicitly
      //
      // Use setUpPersistent() if you want a persistent double
      qx.io.request.Xhr.restore();
    },

    setUpPersistent: function() {
      this.setUpDoubleRequest();
      this.setUpResource();
    },

    setUpDoubleRequest: function() {
      this.req && this.req.dispose();
      var req = this.req = new qx.io.request.Xhr(),
          res = this.res;

      // Stub request methods, leave event system intact
      req = this.shallowStub(req, qx.io.request.AbstractRequest);

      // Inject double and return
      this.injectStub(qx.io.request, "Xhr", req);
      return req;
    },

    setUpResource: function() {
      this.res && this.res.dispose();
      var res = this.res = new qx.io.rest.Resource();

      // Default routes
      res.map("index", "GET", "/photos");
      res.map("current", "GET", "/photos/current");
    },

    tearDown: function() {
      this.getSandbox().restore();
      this.res.dispose();
      this.req.dispose();
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

      params = res._getRequestConfig("index");

      this.assertEquals("GET", params.method);
      this.assertEquals("/photos", params.url);
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

      description =
      {
        index: { method: "GET", url: "/photos" },
        create: { method: "POST", url: "/photos", check: check }
      };

      res = new qx.io.rest.Resource(description);

      params = res._getRequestConfig("index");
      this.assertEquals("GET", params.method);
      this.assertEquals("/photos", params.url);

      params = res._getRequestConfig("create");
      this.assertEquals("POST", params.method);
      this.assertEquals("/photos", params.url);
      this.assertEquals(check, params.check);

      res.dispose();
    },

    "test: map action from description throws with non-object": function() {
      this.assertException(function() {
        var res = new qx.io.rest.Resource([]);
      });
    },

    "test: map action from description throws with incomplete route": function() {
      this.res.dispose();
      this.assertException(function() {
        var description =
        {
          index: { method: "GET", url: "/photos" },
          show: { method: "GET" }
        };
        this.res = new qx.io.rest.Resource(description);
      }, Error, "URL must be string for route 'show'");
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

    "test: invoke action with non-string params": function() {
      var res = this.res,
          req = this.req;

      res.map("show", "GET", "/photos/:id");
      res.show({id: 1});

      this.assertCalledWith(req.setUrl, "/photos/1");
    },

    "test: invoke action with additional params": function() {
      var res = this.res,
          req = this.req,
          call,
          msg;

      res.map("show", "GET", "/photos/:id");
      res.show({id: "1", width: "200"});

      // GET /photos/1?width=200
      call = req.setRequestData.getCall(0);
      if (call) {
        msg = "Request data must include additional param width";
        this.assertEquals("200", call.args[0].width, msg);
      } else {
        this.fail("Must call setRequestData");
      }
    },

    "test: invoke action with additional params not include positional params": function() {
      var res = this.res,
          req = this.req,
          call,
          msg;

      res.map("show", "GET", "/photos/:id");
      res.show({id: "1", width: "200"});

      // GET /photos/1?width=200
      call = req.setRequestData.getCall(0);
      if (call) {
        msg = "Request data must not include positional param id";
        this.assertUndefined(call.args[0].id, msg);
      } else {
        this.fail("Must call setRequestData");
      }
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

    "test: poll action repeatedly": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          msg;

      sandbox.useFakeTimers();
      this.stub(res, "refresh");

      // 1 (immediate) + 10 invocations
      res.poll("index", 10);
      sandbox.clock.tick(100);

      // 1 (immediate) + 5 invocations
      res.poll("index", 20);
      sandbox.clock.tick(100);

      msg = "Renewed call of poll must stop previous timer of action";
      this.assertEquals(17, res.refresh.callCount, msg);
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
          timer,
          numCalled;

      sandbox.useFakeTimers();

      this.stub(res, "refresh");
      timer = res.poll("index", 10);

      sandbox.clock.tick(10);
      numCalled = res.refresh.callCount;

      timer.stop();

      sandbox.clock.tick(100);
      this.assertEquals(numCalled, res.refresh.callCount,
        "Must not refresh after endPoll");
    },

    "test: end poll action does not end polling of other action": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          timer,
          callCount,
          stub;

      sandbox.useFakeTimers();

      res.map("other", "GET", "/photos/other");

      stub = this.stub(res, "refresh").withArgs("other");
      timer = res.poll("index", 10);
      res.poll("other", 10);

      sandbox.clock.tick(10);
      callCount = stub.callCount;
      timer.stop();

      sandbox.clock.tick(100);
      this.assert(stub.callCount > callCount, "Must not end poll stub but was called " +
        stub.callCount + " times which is not greater than " + callCount);
    },

    "test: restart poll action": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          timer,
          stub,
          callCount;

      sandbox.useFakeTimers();
      stub = this.stub(res, "refresh");

      timer = res.poll("index", 10);
      sandbox.clock.tick(10);
      callCount = stub.callCount;
      timer.stop();

      timer.restart();
      sandbox.clock.tick(10);
      this.assert(stub.callCount > callCount, "Must restart poll after end but was called " +
        stub.callCount + " times which is not greater than " + callCount);
    },

    "test: long poll action": function() {
      this.setUpPersistent();

      var res = this.res,
          req = this.req,
          responses = [];

      this.stub(req, "dispose");

      res.addListener("indexSuccess", function(e) {
        responses.push(e.getData());
      }, this);
      res.longPoll("index");

      // longPoll() sets up new request when receiving a response
      this.respond("1");
      this.respond("2");
      this.respond("3");

      this.assertArrayEquals(["1", "2", "3"], responses);
    },

    "test: throttle long poll": function() {
      this.setUpPersistent();

      var res = this.res,
          req = this.req;

      this.stub(req, "dispose");
      this.spy(res, "refresh");
      this.stub(qx.io.rest.Resource, "POLL_THROTTLE_COUNT", "3");

      res.longPoll("index");

      // A number of immediate responses, above count
      for (var i=0; i < 4; i++) {
        this.respond();
      }

      res.refresh = function() {
        throw new Error("With throttling in effect, " +
          "must not make new request.");
      };

      // Throttling
      this.respond();
    },

    "test: not throttle long poll when not received within limit": function() {
      this.setUpPersistent();

      var res = this.res,
          req = this.req,
          sandbox = this.getSandbox();

      this.stub(req, "dispose");

      sandbox.useFakeTimers();
      res.longPoll("index");

      // A number of delayed responses, above count
      for (var i=0; i < 31; i++) {
        sandbox.clock.tick(101);
        this.respond();
      }

      this.spy(res, "refresh");
      sandbox.clock.tick(101);

      this.respond();
      this.assertCalled(res.refresh);
    },

    "test: not throttle long poll when not received subsequently": function() {
      this.setUpPersistent();

      var res = this.res,
          req = this.req,
          sandbox = this.getSandbox();

      this.stub(req, "dispose");

      sandbox.useFakeTimers();
      res.longPoll("index");

      // A number of immediate responses
      for (var i=0; i < 30; i++) {
        this.respond();
      }

      // Delayed response
      sandbox.clock.tick(101);
      this.respond();

      // More immediate responses, total count above limit
      this.spy(res, "refresh");
      for (i=0; i < 10; i++) {
        this.respond();
      }

      this.assertCallCount(res.refresh, 10);
    },

    "test: end long poll action": function() {
      this.setUpPersistent();

      var res = this.res,
          req = this.req,
          handlerId,
          msg;

      this.stub(req, "dispose");
      this.spy(res, "refresh");

      handlerId = res.longPoll("index");

      this.respond();
      this.respond();

      res.removeListenerById(handlerId);
      this.respond();

      this.assertCalledTwice(res.refresh);
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

    "test: fire success": function() {
      var res = this.res,
          req = this.req,
          that = this;

      res.index();
      this.assertEventFired(res, "success", function() {
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
