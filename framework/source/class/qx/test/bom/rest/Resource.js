/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

************************************************************************ */

/**
 * @asset(qx/test/xmlhttp/*)
 */
qx.Class.define("qx.test.bom.rest.Resource",
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
      if (typeof qx.bom.request.SimpleXhr.restore == "function") {
        qx.bom.request.SimpleXhr.restore();
      }

      var req = this.req = new qx.bom.request.SimpleXhr();

      // Stub request methods, but
      // - leave event system intact (addListenerOnce)
      // - leave disposable intact, cause test methods stub it themselves (dispose)
      req = this.shallowStub(req, qx.bom.request.SimpleXhr, ["dispose", "addListenerOnce", "getTransport"]);

      // Inject double and return
      this.injectStub(qx.bom.request, "SimpleXhr", req);

      // Remember request for later disposal
      this.__reqs = this.__reqs || [];
      this.__reqs.push(this.req);

      return req;
    },

    setUpResource: function() {
      this.res && this.res.dispose();
      var res = this.res = new qx.bom.rest.Resource();

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
      res.get = (function() {});

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

      res = new qx.bom.rest.Resource(description);

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
        var res = new qx.bom.rest.Resource([]);
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
        this.res = new qx.bom.rest.Resource(description);
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

      req.toHashCode.restore();

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
      res.map("get", "GET", "/photos/{tag}", {tag: qx.bom.rest.Resource.REQUIRED});
      this.assertException(function() {
        res.get();
      }, Error, "Missing parameter 'tag'");
    },

    "test: invoke action throws when missing required request param": function() {
      var res = new qx.bom.rest.Resource();

      // Require request body param
      res.map("post", "POST", "/photos/", {photo: qx.bom.rest.Resource.REQUIRED});
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

      req.toHashCode.restore();

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
      sandbox.clock.tick(20);

      this.assertCalledWith(res.refresh, "get");
      this.assertCalledOnce(res.refresh);
    },

    "test: not poll action when no response received yet": function() {
      var res = this.res,
          sandbox = this.getSandbox();

      sandbox.useFakeTimers();
      this.spy(res, "refresh");

      res.poll("get", 10);
      sandbox.clock.tick(20);

      this.assertNotCalled(res.refresh);
    },

    "test: poll action immediately": function() {
      var res = this.res;

      this.spy(res, "invoke");
      res.poll("get", 10, undefined, true);
      this.assertCalled(res.invoke);
    },

    "test: poll action sets initial params": function() {
      var res = this.res;

      res.map("get", "GET", "/photos/{id}");
      this.stub(res, "invoke");

      res.poll("get", 10, {id: "1"}, true);
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
      sandbox.clock.tick(20);

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
      sandbox.clock.tick(20);

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
      res.poll("get", 10);
      this.respond();

      // 10ms invoke, 20ms refresh, 30ms refresh
      sandbox.clock.tick(30);
      res.stopPollByAction("get");
      sandbox.clock.tick(100);

      this.assertCalledTwice(res.refresh);
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
      res.poll("post", 10);
      sandbox.clock.tick(20);
      res.stopPollByAction("post");
      sandbox.clock.tick(10);

      this.assertCalledTwice(spy);
    },

    "test: restart poll action": function() {
      var res = this.res,
          sandbox = this.getSandbox(),
          timer;

      sandbox.useFakeTimers();
      this.respond();

      res.poll("get", 10);
      sandbox.clock.tick(10);
      res.stopPollByAction("get");

      this.spy(res, "refresh");
      res.restartPollByAction("get");
      sandbox.clock.tick(10);
      this.assertCalled(res.refresh);
    },

    "test: long poll action": function() {
      var res = this.res,
          req = this.req,
          responses = [];

      // undo this line from setUp() ...
      // this.injectStub(qx.bom.request, "SimpleXhr", req);
      // ... in order to have unique reqs instead of always
      //     the same stubbed req from the setUp method.
      qx.bom.request.SimpleXhr.restore();

      this.stub(req, "dispose");

      res.addListener("getSuccess", function(e) {
        responses.push(e.response);
      }, this);
      res.longPoll("get");

      // longPoll() sets up new request when receiving a response
      this.respondSubsequent("1", 0, true);
      this.respondSubsequent("2", 1, true);
      this.respondSubsequent("3", 2, true);

      this.assertArrayEquals(["1", "2", "3"], responses);
    },

    "test: throttle long poll": function() {
      var res = this.res,
          req = this.req;

      this.stub(req, "dispose");
      this.spy(res, "refresh");
      this.stub(qx.bom.rest.Resource, "POLL_THROTTLE_COUNT", "3");

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

      // undo this line from setUp() ...
      // this.injectStub(qx.bom.request, "SimpleXhr", req);
      // ... in order to have unique reqs instead of always
      //     the same stubbed req from the setUp method.
      qx.bom.request.SimpleXhr.restore();

      this.stub(req, "dispose");

      sandbox.useFakeTimers();
      res.longPoll("get");

      // A number of delayed responses, above count
      for (var i=0; i < 31; i++) {
        sandbox.clock.tick(101);
        this.respondSubsequent(null, i);
      }

      this.spy(res, "refresh");
      sandbox.clock.tick(101);

      this.respondSubsequent(null, i);
      this.assertCalled(res.refresh);
    },

    "test: not throttle long poll when not received subsequently": function() {
      var res = this.res,
          req = this.req,
          sandbox = this.getSandbox();

      // undo this line from setUp() ...
      // this.injectStub(qx.bom.request, "SimpleXhr", req);
      // ... in order to have unique reqs instead of always
      //     the same stubbed req from the setUp method.
      qx.bom.request.SimpleXhr.restore();

      this.stub(req, "dispose");

      sandbox.useFakeTimers();
      res.longPoll("get");

      // A number of immediate responses
      for (var i=0; i < 30; i++) {
        this.respondSubsequent(null, i);
      }

      // Delayed response
      sandbox.clock.tick(101);
      this.respondSubsequent(null, i++);

      // // More immediate responses, total count above limit
      this.spy(res, "refresh");
      for (var j=0; j < 10; j++) {
        this.respondSubsequent(null, (i+j));
      }

      this.assertCallCount(res.refresh, 10);
    },

    "test: end long poll action": function() {
      var res = this.res,
          req = this.req,
          handlerId,
          msg;

      // undo this line from setUp() ...
      // this.injectStub(qx.bom.request, "SimpleXhr", req);
      // ... in order to have unique reqs instead of always
      //     the same stubbed req from the setUp method.
      qx.bom.request.SimpleXhr.restore();

      this.stub(req, "dispose");
      this.spy(res, "refresh");

      handlerId = res.longPoll("get");

      this.respondSubsequent(null, 0);
      this.respondSubsequent(null, 1);

      res.removeListenerById(handlerId);
      this.respondSubsequent(null, 2);

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
        that.assertEquals("Affe", e.response);
        that.assertIdentical(req, e.request);
        that.assertEquals("get", e.action);
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
        that.assertEquals("Affe", e.response);
        that.assertIdentical(req, e.request);
        that.assertEquals("get", e.action);
      });
    },

    "test: fire actionError": function() {
      var res = this.res,
          req = this.req,
          that = this;

      res.get();
      this.assertEventFired(res, "getError", function() {
        that.respondError();
      }, function(e) {
        that.assertIdentical(req, e.request);
        that.assertEquals("get", e.action);
      });
    },

    "test: fire error": function() {
      var res = this.res,
          req = this.req,
          that = this;

      res.get();
      this.assertEventFired(res, "error", function() {
        that.respondError();
      }, function(e) {
        that.assertIdentical(req, e.request);
        that.assertEquals("get", e.action);
      });
    },

    "test: fire started" : function() {

      qx.bom.request.SimpleXhr.restore();

      var res = this.res,
          req = this.req,
          that = this;

      var listener = this.spy();
      res.on("started", listener);
      res.get();

      window.setTimeout(function() {
        this.resume(function() {
          this.assertTrue(listener.calledOnce);
        }, this);
      }.bind(this), 200);

      this.wait(500);
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

      window.setTimeout(function() {
        this.resume(function() {
          this.assertCalledOnce(req.dispose);
        }, this);
      }.bind(this), 100);

      this.wait(200);
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
      req = req || this.req;
      response = response || "";

      req.isDone.returns(true);
      req.getResponse.returns(response);
      req.emit("success");
      req.emit("loadEnd");
    },

    // Fake response but find and manipulate matching requests *within* res
    // which is important for tests with more than one request (e.g. poll and long poll)
    respondSubsequent: function(response, reqIdx, shouldStubResp) {
      var response = response || "",
          validReqIdx = (reqIdx !== undefined);

      // this.res.__requests isn't available after 'privates' optimization
      // so find it by some kind of feature detection - this isn't beautiful,
      // but adding a protected getter just for that is worse
      var requests = "";
      Object.keys(this.res).forEach(function(propName) {
        if (propName.indexOf("__") === 0 &&
            "get" in this.res[propName] &&
            qx.lang.Type.isArray(this.res[propName].get) &&
            qx.lang.Type.isObject(this.res[propName].get[0]) &&
            "$$hash" in this.res[propName].get[0]) {
          requests = propName;
        }
      }, this);

      if (validReqIdx && requests) {
        var reqWithin = this.res[requests].get[reqIdx];
        if (shouldStubResp) {
          this.stub(reqWithin, "isDone");
          this.stub(reqWithin, "getResponse");
          reqWithin.isDone.returns(true);
          reqWithin.getResponse.returns(response);
        }
        reqWithin.emit("success");
        reqWithin.emit("loadEnd");
        this.res[requests].get[reqIdx] = reqWithin;
      }
    },

    // Fake erroneous response
    respondError: function() {
      var req = this.req;
      req.emit("fail");
      req.emit("loadEnd");
    }

  }
});
