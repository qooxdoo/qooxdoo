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
    },

    setUpDoubleRequest: function() {
      // Restore Xhr when wrapped before
      if (typeof qx.io.request.Xhr.restore == "function") {
        qx.io.request.Xhr.restore();
      }

      var req = this.req = new qx.io.request.Xhr();

      // Stub request methods, leave event system intact
      req = this.shallowStub(req, qx.io.request.AbstractRequest);

      // Inject double and return
      this.injectStub(qx.io.request, "Xhr", req);

      // Remember request for later disposal
      this.__reqs = this.__reqs || [];
      this.__reqs.push(this.req);

      return req;
    },

    setUpResource: function() {
      this.res && this.res.dispose();
      var res = this.res = new qx.io.rest.Resource();

      // Default routes
      res.map("get", "GET", "/photos");
      res.map("post", "POST", "/photos");
    },

    tearDown: function() {
      this.getSandbox().restore();
      this.res.dispose();
      this.__reqs.forEach(function(req) {
        req.dispose();
      });
    },

    //
    // Configuration
    //

    "test: configure request receives pre-configured but unsent request": function() {
      var res = this.res,
          req = this.req;

      res.configureRequest(qx.lang.Function.bind(function(req) {
        this.assertCalledWith(req.setMethod, "GET");
        this.assertCalled(req.setUrl, "/photos");
        this.assertNotCalled(req.send);
      }, this));

      res.get();
    },

    "test: configure request receives invocation details": function() {
      var res = this.res,
          req = this.req,
          params = {},
          data = {},
          callback;

      callback = this.spy(qx.lang.Function.bind(function(req, _action, _params, _data) {
        this.assertEquals("get", _action, "Unexpected action");
        this.assertEquals(params, _params, "Unexpected params");
        this.assertEquals(data, _data, "Unexpected data");
      }, this));
      res.configureRequest(callback);

      res.get(params, data);
      this.assertCalled(callback);
    },

    //
    // Route
    //

    "test: map action": function() {
      var res = this.res,
          params;

      params = res._getRequestConfig("get");

      this.assertEquals("GET", params.method);
      this.assertEquals("/photos", params.url);
    },

    "test: map action when base URL": function() {
      var res = this.res,
          params;

      res.setBaseUrl("http://example.com");
      params = res._getRequestConfig("get");

      this.assertEquals("http://example.com/photos", params.url);
    },

    "test: map existing action": function() {
      var res = this.res,
          params;

      res.map("post", "GET", "/articles");
      params = res._getRequestConfig("post");

      this.assertEquals("/articles", params.url);
    },

    "test: map action creates method": function() {
      var res = this.res,
          req = this.req;

      this.assertFunction(res.get);
    },

    "test: map action throws when existing method": function() {
      this.require(["debug"]);

      var res = this.res,
          req = this.req;

      // For whatever reason
      res.popular = function() {};

      this.assertException(function() {
        res.map("popular", "GET", "/photos/popular");
      }, Error);
    },

    "test: map action does not throw when existing method is empty": function() {
      this.require(["debug"]);

      var res = this.res,
          req = this.req;

      // For documentation purposes
      res.get = qx.lang.Function.empty;

      res.map("get", "GET", "/photos/popular");
    },

    "test: dynamically created action forwards arguments": function() {
      var res = this.res,
          req = this.req;

      this.spy(res, "invoke");
      res.get({}, 1, 2, 3);

      this.assertCalledWith(res.invoke, "get", {}, 1, 2, 3);
    },

    "test: dynamically created action returns what invoke returns": function() {
      var id = 1;
      this.stub(this.res, "invoke").returns(id);
      this.assertEquals(id, this.res.get());
    },

    "test: map actions from description": function() {
      var req = this.req,
          description,
          res,
          check = {},
          params;

      description =
      {
        get: { method: "GET", url: "/photos" },
        create: { method: "POST", url: "/photos", check: check }
      };

      res = new qx.io.rest.Resource(description);

      params = res._getRequestConfig("get");
      this.assertEquals("GET", params.method);
      this.assertEquals("/photos", params.url);

      params = res._getRequestConfig("create");
      this.assertEquals("POST", params.method);
      this.assertEquals("/photos", params.url);
      this.assertEquals(check, params.check);

      res.dispose();
    },

    "test: map action from description throws with non-object": function() {
      this.require(["debug"]);

      this.assertException(function() {
        var res = new qx.io.rest.Resource([]);
      });
    },

    "test: map action from description throws with incomplete route": function() {
      this.require(["debug"]);

      this.res.dispose();
      this.assertException(function() {
        var description =
        {
          get: { method: "GET"}
        };
        this.res = new qx.io.rest.Resource(description);
      }, Error, "URL must be string for route 'get'");
    },

    //
    // Invoke
    //

    "test: invoke action generically": function() {
      var res = this.res,
          req = this.req,
          result;

      result = res.invoke("get");

      this.assertSend();
    },

    "test: invoke action": function() {
      var res = this.res,
          req = this.req;

      res.get();

      this.assertSend();
    },

    "test: invoke action returns id of request": function() {
      var res = this.res,
          req = this.req;

      this.assertNumber(res.invoke("get"));
    },

    "test: invoke action while other is in progress": function() {
      var res = this.res,
          req1, req2;

      req1 = this.req;
      res.get();

      this.setUpDoubleRequest();

      req2 = this.req;
      res.post();

      this.assertCalledOnce(req1.send);
      this.assertCalledOnce(req2.send);
    },

    "test: invoke same action handles multiple requests": function() {
      var res = this.res,
          req1, req2,
          getSuccess = this.spy();

      res.addListener("getSuccess", getSuccess);

      req1 = this.req;
      res.get();

      this.setUpDoubleRequest();

      req2 = this.req;
      res.get();

      this.respond("", req1);
      this.respond("", req2);

      this.assertCalledTwice(getSuccess);
    },

    "test: invoke action with positional params": function() {
      var res = this.res,
          req = this.req;

      res.map("get", "GET", "/photos/{id}");
      res.get({id: "1"});

      this.assertCalledWith(req.setUrl, "/photos/1");
    },

    "test: invoke action with positional params that evaluate to false": function() {
      var res = this.res,
          req = this.req;

      res.map("get", "GET", "/photos/{id}");
      res.get({id: 0});

      this.assertCalledWith(req.setUrl, "/photos/0");
    },

    "test: invoke action with non-string params": function() {
      var res = this.res,
          req = this.req;

      res.map("get", "GET", "/photos/{id}");
      res.get({id: 1});

      this.assertCalledWith(req.setUrl, "/photos/1");
    },

    "test: invoke action with params and data": function() {
      var res = this.res,
          req = this.req;

      res.map("put", "PUT", "/articles/{id}");
      res.put({id: "1"}, {article: '{title: "Affe"}'});

      // Note that with method GET, parameters are appended to the URLs query part.
      // Please refer to the API docs of qx.io.request.AbstractRequest#requestData.
      //
      // res.get({id: "1"}, {lang: "de"});
      // --> /articles/1/?lang=de

      this.assertCalledWith(req.setRequestData, {article: '{title: "Affe"}'});
    },

    "test: invoke action with multiple positional params": function() {
      var res = this.res,
          req = this.req;

      res.map("get", "GET", "/photos/{id}/comments/{commentId}");
      res.get({id: "1", commentId: "2"});

      this.assertCalledWith(req.setUrl, "/photos/1/comments/2");
    },

    "test: invoke action with positional params in query": function() {
      var res = this.res,
          req = this.req;

      res.map("get", "GET", "/photos/{id}/comments?id={commentId}");
      res.get({id: "1", commentId: "2"});

      this.assertCalledWith(req.setUrl, "/photos/1/comments?id=2");
    },

    "test: invoke action with undefined params": function() {
      var res = this.res,
          req = this.req;

      res.get();
      this.assertCalled(req.send);
    },

    "test: invoke action with null params": function() {
      var res = this.res,
          req = this.req;

      res.get(null);
      this.assertCalled(req.send);
    },

    "test: invoke action when content type json": function() {
      var res = this.res,
          req = this.req;

      req.setRequestHeader.restore();
      req.getRequestHeader.restore();

      res.configureRequest(function(req) {
        req.setRequestHeader("Content-Type", "application/json");
      });

      this.spy(qx.lang.Json, "stringify");
      var data = {location: "Karlsruhe"};
      res.map("post", "POST", "/photos/{id}/meta");
      res.post({id: 1}, data);

      this.assertCalledWith(req.setRequestData, '{"location":"Karlsruhe"}');
      this.assertCalledWith(qx.lang.Json.stringify, data);
    },

    "test: invoke action when content type json and get": function() {
      var res = this.res,
          req = this.req;

      req.setMethod.restore();
      req.getMethod.restore();

      this.spy(qx.lang.Json, "stringify");
      req.getRequestHeader.withArgs("Content-Type").returns("application/json");
      res.get();

      this.assertNotCalled(qx.lang.Json.stringify);
    },

    "test: invoke action for url with port": function() {
      var res = this.res,
          req = this.req;

      res.map("get", "GET", "http://example.com:8080/photos/{id}");
      res.get({id: "1"});

      this.assertCalledWith(req.setUrl, "http://example.com:8080/photos/1");
    },

    "test: invoke action for relative url": function() {
      var res = this.res,
          req = this.req;

      res.map("get", "GET", "{page}");
      res.get({page: "index"});
      this.assertCalledWith(req.setUrl, "index");
    },

    "test: invoke action for relative url with dots": function() {
      var res = this.res,
          req = this.req;

      res.map("get", "GET", "../{page}");
      res.get({page: "index"});
      this.assertCalledWith(req.setUrl, "../index");
    },

    "test: invoke action for route with check": function() {
      var res = this.res;

      res.map("get", "GET", "/photos/zoom/{id}", {id: /\d+/});
      res.get({id: "123"});

      this.assertSend("GET", "/photos/zoom/123");
    },

    "test: invoke action fills in empty string when missing param and no default": function() {
      var res = this.res;

      res.map("get", "GET", "/photos/{tag}");
      res.get();

      this.assertSend("GET", "/photos/");
    },

    "test: invoke action fills in default when missing param": function() {
      var res = this.res;

      res.map("get", "GET", "/photos/{tag=recent}/{size}");
      res.get({size: "large"});

      this.assertSend("GET", "/photos/recent/large");
    },

    "test: invoke action throws when missing required positional param": function() {
      var res = this.res;

      // Require positional param
      res.map("get", "GET", "/photos/{tag}", {tag: qx.io.rest.Resource.REQUIRED});
      this.assertException(function() {
        res.get();
      }, Error, "Missing parameter 'tag'");
    },

    "test: invoke action throws when missing required request param": function() {
      var res = new qx.io.rest.Resource();

      // Require request body param
      res.map("post", "POST", "/photos/", {photo: qx.io.rest.Resource.REQUIRED});
      this.assertException(function() {
        res.post();
      }, Error, "Missing parameter 'photo'");
    },

    "test: invoke action throws when param not match check": function() {
      var res = this.res;

      res.map("get", "GET", "/photos/{id}", {id: /\d+/});
      this.assertException(function() {
        res.get({id: "FAIL"});
      }, Error, "Parameter 'id' is invalid");
    },

    "test: invoke action ignores invalid check in production": function() {
      this.require(["debug"]);

      var res = this.res;

      var setting = this.stub(qx.core.Environment, "get").withArgs("qx.debug");
      setting.returns(false);

      // Invalid check
      res.map("get", "GET", "/photos/{id}", {id: ""});
      res.get({id: 1});
    },

    //
    // Abort
    //

    "test: abort action": function() {
      var res = this.res,
          req = this.req;

      res.get();
      res.abort("get");

      this.assertCalledOnce(req.abort);
    },

    "test: abort action when multiple requests": function() {
      var res = this.res,
          req1, req2;

      req1 = this.setUpDoubleRequest();
      res.get();

      req2 = this.setUpDoubleRequest();
      res.get();

      res.abort("get");

      this.assertCalledOnce(req1.abort);
      this.assertCalledOnce(req2.abort);
    },

    "test: abort by action id": function() {
      var res = this.res,
          req = this.req;

      var id = res.get();
      res.abort(id);

      this.assertCalledOnce(req.abort);
    },

    //
    // Helper
    //

    "test: refresh action": function() {
      var res = this.res,
          req = this.req;

      res.get();
      this.assertSend();

      res.refresh("get");
      this.assertSend();
    },

    "test: refresh action replaying previous params": function() {
      var res = this.res,
          req = this.req;

      res.map("get", "GET", "/photos/{id}");
      res.get({id: "1"});
      this.assertSend("GET", "/photos/1");

      res.refresh("get");
      this.assertSend("GET", "/photos/1");
    },

    "test: poll action": function() {
      var res = this.res,
          sandbox = this.getSandbox();

      sandbox.useFakeTimers();
      this.spy(res, "refresh");

      res.poll("get", 10);
      this.respond();
      sandbox.clock.tick(10);

      this.assertCalledWith(res.refresh, "get");
      this.assertCalledOnce(res.refresh);
    },

    "test: not poll action when no response received yet": function() {
      var res = this.res,
          sandbox = this.getSandbox();

      sandbox.useFakeTimers();
      this.spy(res, "refresh");

      res.poll("get", 10);
      sandbox.clock.tick(10);

      this.assertNotCalled(res.refresh);
    },

    "test: poll action immediately": function() {
      var res = this.res;

      this.spy(res, "invoke");
      res.poll("get", 10);
      this.assertCalled(res.invoke);
    },

    "test: poll action sets initial params": function() {
      var res = this.res;

      res.map("get", "GET", "/photos/{id}");
      this.stub(res, "invoke");

      res.poll("get", 10, {id: "1"});
      this.assertCalledWith(res.invoke, "get", {id: "1"});
    },

    "test: poll action replaying previous params": function() {
      var res = this.res,
          req = this.req;

      res.map("get", "GET", "/photos/{id}");
      res.get({id: "1"});
      this.assertSend("GET", "/photos/1");

      res.poll("get");
      this.assertSend("GET", "/photos/1");
    },

    "test: poll action repeatedly ends previous timer": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          msg;

      sandbox.useFakeTimers();
      this.stub(res, "refresh");

      res.poll("get", 10);
      this.respond();
      sandbox.clock.tick(10);

      res.poll("get", 100);
      this.respond();
      sandbox.clock.tick(100);

      this.assertCalledTwice(res.refresh);
    },

    "test: poll many actions": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          spy,
          get,
          post;

      this.stub(this.req, "dispose");
      sandbox.useFakeTimers();

      spy = this.spy(res, "refresh");
      get = spy.withArgs("get");
      post = spy.withArgs("post");

      res.poll("get", 10);
      res.poll("post", 10);
      this.respond();
      sandbox.clock.tick(10);

      this.assertCalledOnce(get);
      this.assertCalledOnce(post);

      this.req.dispose.restore();
      this.req.dispose();
    },

    "test: end poll action": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          timer,
          numCalled;

      sandbox.useFakeTimers();

      this.spy(res, "refresh");
      timer = res.poll("get", 10);
      this.respond();

      sandbox.clock.tick(10);
      timer.stop();
      sandbox.clock.tick(100);

      this.assertCalledOnce(res.refresh);
    },

    "test: end poll action does not end polling of other action": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          timer,
          spy;

      sandbox.useFakeTimers();
      spy = this.spy(res, "refresh").withArgs("get");
      this.respond();

      res.poll("get", 10);
      timer = res.poll("post", 10);
      sandbox.clock.tick(10);
      timer.stop();
      sandbox.clock.tick(10);

      this.assertCalledTwice(spy);
    },

    "test: restart poll action": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          timer;

      sandbox.useFakeTimers();
      this.respond();

      timer = res.poll("get", 10);
      sandbox.clock.tick(10);
      timer.stop();

      this.spy(res, "refresh");
      timer.restart();
      sandbox.clock.tick(10);
      this.assertCalled(res.refresh);
    },

    "test: long poll action": function() {
      var res = this.res,
          req = this.req,
          responses = [];

      this.stub(req, "dispose");

      res.addListener("getSuccess", function(e) {
        responses.push(e.getData());
      }, this);
      res.longPoll("get");

      // longPoll() sets up new request when receiving a response
      this.respond("1");
      this.respond("2");
      this.respond("3");

      this.assertArrayEquals(["1", "2", "3"], responses);
    },

    "test: throttle long poll": function() {
      var res = this.res,
          req = this.req;

      this.stub(req, "dispose");
      this.spy(res, "refresh");
      this.stub(qx.io.rest.Resource, "POLL_THROTTLE_COUNT", "3");

      res.longPoll("get");

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
      var res = this.res,
          req = this.req,
          sandbox = this.getSandbox();

      this.stub(req, "dispose");

      sandbox.useFakeTimers();
      res.longPoll("get");

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
      var res = this.res,
          req = this.req,
          sandbox = this.getSandbox();

      this.stub(req, "dispose");

      sandbox.useFakeTimers();
      res.longPoll("get");

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
      var res = this.res,
          req = this.req,
          handlerId,
          msg;

      this.stub(req, "dispose");
      this.spy(res, "refresh");

      handlerId = res.longPoll("get");

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

      res.get();
      this.assertEventFired(res, "getSuccess", function() {
        that.respond("Affe");
      }, function(e) {
        that.assertEquals("Affe", e.getData());
        that.assertEquals("get", e.getAction());
        that.assertIdentical(req, e.getRequest());
        that.assertInteger(e.getId());
      });
    },

    "test: fire success": function() {
      var res = this.res,
          req = this.req,
          that = this;

      res.get();
      this.assertEventFired(res, "success", function() {
        that.respond("Affe");
      }, function(e) {
        that.assertEquals("Affe", e.getData());
        that.assertEquals("get", e.getAction());
        that.assertIdentical(req, e.getRequest());
        that.assertInteger(e.getId());
      });
    },

    "test: fire actionError": function() {
      var res = this.res,
          req = this.req,
          that = this;

      res.get();
      this.assertEventFired(res, "getError", function() {
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

      res.get();
      this.assertEventFired(res, "error", function() {
        that.respondError("statusError");
      }, function(e) {
        that.assertEquals("statusError", e.getPhase());
        that.assertIdentical(req, e.getRequest());
      });
    },

    //
    // Dispose
    //

    "test: dispose requests": function() {
      var res = this.res,
          req1, req2;

      req1 = this.req;
      res.get();

      this.setUpDoubleRequest();

      req2 = this.req;
      res.post();

      this.spy(req1, "dispose");
      this.spy(req2, "dispose");

      res.dispose();

      this.assertCalled(req1.dispose);
      this.assertCalled(req2.dispose);
    },

    "test: dispose requests of same action": function() {
      var res = this.res,
          req1, req2;

      req1 = this.req;
      res.get();

      this.setUpDoubleRequest();

      req2 = this.req;
      res.get();

      this.spy(req1, "dispose");
      this.spy(req2, "dispose");

      res.dispose();

      this.assertCalled(req1.dispose);
      this.assertCalled(req2.dispose);
    },

    "test: dispose request on loadEnd": function() {
      var res = this.res,
          req = this.req;

      this.spy(req, "dispose");

      res.get();
      this.respond();

      this.assertCalledOnce(req.dispose);
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

    hasDebug: function() {
      return qx.core.Environment.get("qx.debug");
    },

    // Fake response
    respond: function(response, req) {
      var req = req || this.req;
      response = response || "";
      req.isDone.returns(true);
      req.getPhase.returns("success");
      req.getResponse.returns(response);
      req.fireEvent("success");
      req.fireEvent("loadEnd");
    },

    // Fake erroneous response
    respondError: function(phase) {
      var req = this.req;
      phase = phase || "statusError";
      req.getPhase.returns(phase);
      req.fireEvent("fail");
      req.fireEvent("loadEnd");
    }

  }
});
