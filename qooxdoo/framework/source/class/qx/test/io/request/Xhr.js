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
#ignore(Klass)
************************************************************************ */

/* ************************************************************************
#asset(qx/test/xmlhttp/*)
************************************************************************ */

/**
 * @lint ignoreUndefined(Klass)
 */
qx.Class.define("qx.test.io.request.Xhr",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.test.io.MRemoteTest,
             qx.dev.unit.MMock,
             qx.dev.unit.MRequirements],

  members :
  {
    setUp: function() {
      this.setUpRequest();
    },

    setUpRequest: function() {
      this.req = new qx.io.request.Xhr;
      this.req.setUrl("url");
    },

    setUpFakeTransport: function() {
      this.transport = this.stub(new qx.bom.request.Xhr());
      this.stub(this.transport, "open");
      this.stub(this.transport, "setRequestHeader");
      this.stub(this.transport, "send");
      this.stub(this.transport, "abort");
      this.stub(this.transport, "getResponseHeader");
      this.stub(qx.io.request.Xhr.prototype, "_createTransport").
          returns(this.transport);

      this.setUpRequest();
    },

    setUpFakeServer: function() {
      this.useFakeServer();
      this.setUpRequest();

      this.server = this.getServer();
      this.server.respondWith("GET", "/found", [200, {"Content-Type": "text/html"}, "FOUND"]);
      this.server.respondWith("GET", "/found.json", [200, {"Content-Type": "application/json"}, "JSON"]);
    },

    setUpFakeXhr: function() {
      this.useFakeXMLHttpRequest();
      this.setUpRequest();
    },

    setUpKlass: function() {
      qx.Class.define("Klass", {
        extend : qx.core.Object,

        properties :
        {
          affe: {
            init: true
          }
        }
      });
    },

    tearDown: function() {
      this.getSandbox().restore();
      this.req.dispose();

      // May fail in IE
      try { qx.Class.undefine("Klass"); } catch(e) {}
    },

    //
    // Full stack tests
    //

    "test: fetch resource": function() {
      // TODO: Adjust URL when file://
      this.require(["http"]);

      var req = new qx.io.request.Xhr(),
          url = this.noCache(this.getUrl("qx/test/xmlhttp/sample.txt"));

      req.addListener("success", function(e) {
        this.resume(function() {
          this.assertEquals("SAMPLE", e.getTarget().getResponseText());
        }, this);
      }, this);

      req.setUrl(url);
      req.send();

      this.wait();
    },

    "test: recycle request": function() {
      this.require(["http"]);

      var req = new qx.io.request.Xhr(),
          url1 = this.noCache(this.getUrl("qx/test/xmlhttp/sample.txt") + "?1"),
          url2 = this.noCache(this.getUrl("qx/test/xmlhttp/sample.txt") + "?2"),
          count = 0;

      req.addListener("success", function() {
        count++;

        if (count == 2) {
          this.resume();
        } else {
          req.setUrl(url2);
          req.send();
        }
      }, this);

      req.setUrl(url1);
      req.send();

      this.wait();
    },

    // "test: fetch resources simultaneously": function() {
    //   this.require(["php"]);
    //
    //   var count = 1,
    //       upTo = 20,
    //       startedAt = new Date(),
    //       duration = 0;
    //
    //   for (var i=0; i<upTo; i++) {
    //     var req = new qx.io.request.Xhr(),
    //         url = this.noCache(this.getUrl("qx/test/xmlhttp/loading.php")) + "&duration=6";
    //
    //     req.addListener("success", function() {
    //       this.resume(function() {
    //         // In seconds
    //         duration = (new Date() - startedAt) / 1000;
    //         this.debug("Request #" + count + " completed (" +  duration + ")");
    //         if (count == upTo) {
    //           return;
    //         }
    //
    //         ++count;
    //         this.wait(6000 + 1000);
    //       }, this);
    //     }, this);
    //
    //     req.setUrl(url);
    //     req.send();
    //   }
    //
    //   // Provided two concurrent requests are made (each 6s), 20 requests
    //   // (i.e. 10 packs of requests) should complete after 60s
    //   this.wait(60000 + 1000);
    // },

    //
    // General
    //

    "test: dispose transport on destruct": function() {
      this.setUpFakeTransport();
      this.spy(this.transport, "dispose");
      this.req.dispose();

      this.assertCalled(this.transport.dispose);
    },

    "test: get transport": function() {
      this.setUpFakeTransport();
      this.assertEquals(this.transport, this.req.getTransport());
    },

    //
    // Send
    //

    "test: send GET request": function() {
      this.setUpFakeTransport();
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url", true);
      this.assertCalled(this.transport.send);
    },

    "test: send POST request": function() {
      this.setUpFakeTransport();
      this.req.setMethod("POST");
      this.req.send();

      this.assertCalledWith(this.transport.open, "POST");
    },

    "test: send sync request": function() {
      // TODO: Firefox: "Access to restricted URI denied"
      this.require(["http"]);

      this.setUpFakeTransport();
      this.req.setAsync(false);
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url", false);
      this.assertCalled(this.transport.send);
    },

    "test: drop fragment from URL": function() {
      this.setUpFakeTransport();
      this.req.setUrl("example.com#fragment");
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "example.com");
    },

    //
    // Data with GET
    //

    "test: not send data with GET request": function() {
      this.setUpFakeTransport();
      this.req.setRequestData("str");
      this.req.send();

      this.assertCalledWith(this.transport.send, null);
    },

    "test: append string data to URL with GET request": function() {
      this.setUpFakeTransport();
      this.req.setRequestData("str");
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url?str");
    },

    "test: append obj data to URL with GET request": function() {
      this.setUpFakeTransport();
      this.req.setRequestData({affe: true});
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url?affe=true");
    },

    "test: append qooxdoo obj data to URL with GET request": function() {
      this.setUpFakeTransport();
      this.setUpKlass();
      var obj = new Klass();
      this.req.setRequestData(obj);
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url?affe=true");
    },

    //
    // Data with POST
    //

    "test: set content type urlencoded for POST request": function() {
      this.setUpFakeTransport();
      this.req.setMethod("POST");
      this.req.send();

      this.assertCalledWith(this.transport.setRequestHeader,
           "Content-Type", "application/x-www-form-urlencoded");
    },

    "test: send string data with POST request": function() {
      this.setUpFakeTransport();
      this.req.setMethod("POST");
      this.req.setRequestData("str");
      this.req.send();

      this.assertCalledWith(this.transport.send, "str");
    },

    "test: send obj data with POST request": function() {
      this.setUpFakeTransport();
      this.req.setMethod("POST");
      this.req.setRequestData({"af fe": true});
      this.req.send();

      this.assertCalledWith(this.transport.send, "af+fe=true");
    },

    "test: send qooxdoo obj data with POST request": function() {
      this.setUpFakeTransport();
      this.setUpKlass();
      var obj = new Klass();
      this.req.setMethod("POST");
      this.req.setRequestData(obj);
      this.req.send();

      this.assertCalledWith(this.transport.send, "affe=true");
    },

    //
    // Header and Params
    //

    "test: set request headers": function() {
      this.setUpFakeTransport();
      this.req.setRequestHeaders({key1: "value", key2: "value"});
      this.req.send();

      this.assertCalledWith(this.transport.setRequestHeader, "key1", "value");
      this.assertCalledWith(this.transport.setRequestHeader, "key2", "value");
    },

    "test: not append cache parameter to URL": function() {
      this.setUpFakeTransport();
      this.req.send();

      var msg = "nocache parameter must not be set";
      this.assertFalse(/\?nocache/.test(this.transport.open.args[0][1]), msg);
    },

    "test: append nocache parameter to URL": function() {
      this.setUpFakeTransport();
      this.req.setCache(false);
      this.req.send();

      var msg = "nocache parameter must be set to number";
      this.assertTrue(/\?nocache=\d{13,}/.test(this.transport.open.args[0][1]), msg);
    },

    "test: set nocache request header": function() {
      this.setUpFakeTransport();
      this.req.setCache("force-validate");
      this.req.send();

      this.assertCalledWith(this.transport.setRequestHeader, "Cache-Control", "no-cache");
    },

    "test: set accept header": function() {
      this.setUpFakeTransport();
      this.req.setAccept("application/json");
      this.req.send();

      this.assertCalledWith(this.transport.setRequestHeader, "Accept", "application/json");
    },

    "test: get response content type": function() {
      this.stub(this.req, "getResponseHeader");
      this.req.getResponseContentType();

      this.assertCalledWith(this.req.getResponseHeader, "Content-Type");
    },

    //
    // Events
    //

    "test: fire multiple readystatechange": function() {
      this.setUpFakeServer();
      var req = this.req,
          server = this.server,
          spy = this.spy();

      req.setUrl("/found");
      req.setMethod("GET");

      req.addListener("readystatechange", spy);
      req.send();
      server.respond();

      this.assertCallCount(spy, 4);
    },

    "test: fire success": function() {
      this.setUpFakeTransport();
      var req = this.req,
          success = this.spy();

      req.addListener("success", success);
      this.respond();

      this.assertCalledOnce(success);
    },

    "test: not fire success on erroneous status": function() {
      this.setUpFakeTransport();
      var req = this.req,
          success = this.spy();

      req.addListener("success", success);
      this.respond(500);

      this.assertNotCalled(success);
    },

    "test: fire load": function() {
      this.setUpFakeTransport();
      var req = this.req,
          load = this.spy();

      req.addListener("load", load);
      this.respond();

      this.assertCalledOnce(load);
    },

    "test: fire loadend": function() {
      this.setUpFakeTransport();
      var req = this.req,
          loadend = this.spy();

      req.addListener("loadend", loadend);
      this.respond();

      this.assertCalledOnce(loadend);
    },

    "test: fire abort": function() {
      this.setUpFakeTransport();
      var req = this.req,
          abort = this.spy();

      req.addListener("abort", abort);
      this.transport.onabort();

      this.assertCalledOnce(abort);
    },

    "test: fire timeout": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport,
          timeout = this.spy();

      req.setTimeout(1);
      req.send();

      req.addListener("timeout", timeout);
      transport.ontimeout();

      this.assertEquals(1000, transport.timeout);
      this.assertCalledOnce(timeout);
    },

    "test: fire error": function() {
      this.setUpFakeTransport();
      var req = this.req,
          error = this.spy();

      req.addListener("error", error);
      this.respondError();

      this.assertCalledOnce(error);
    },

    "test: fire remoteError": function() {
      this.setUpFakeTransport();
      var req = this.req,
          remoteError = this.spy();

      req.addListener("remoteError", remoteError);
      this.respond(500);

      this.assertCalledOnce(remoteError);
    },

    "test: fire fail on erroneous status": function() {
      this.setUpFakeTransport();
      var req = this.req,
          fail = this.spy();

      req.addListener("fail", fail);
      this.respond(500);

      this.assertCalledOnce(fail);
    },

    "test: fire fail on network error": function() {
      this.setUpFakeTransport();
      var req = this.req,
          fail = this.spy();

      req.addListener("fail", fail);

      // When a network error occured, an HTTP status can never be set
      // (If it was, two fail events would be fired)
      this.respondError(0);

      this.assertCalledOnce(fail);
    },

    //
    // Handler
    //

    // Documentation only
    "test: event handler receives request": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport,
          that = this;

      transport.readyState = 4;
      transport.status = 200;
      transport.responseText = "Affe";

      req.addListener("success", function(e) {
        that.assertEquals(e.getTarget(), req);
        that.assertEquals("Affe", e.getTarget().getResponseText());
      });

      transport.onreadystatechange();
    },

    // Documentation only
    "test: event handler's this is request": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport,
          that = this;

      transport.readyState = 4;
      transport.status = 200;
      transport.responseText = "Affe";

      req.addListener("success", function() {
        that.assertEquals(this, req);
        that.assertEquals("Affe", this.getResponseText());
      });

      transport.onreadystatechange();
    },

    //
    // Properties
    //

    "test: sync XHR properties for every readyState": function() {
      // TODO: Status is [0, 200, 200, 200] when from file://
      this.require(["http"]);

      this.setUpFakeServer();
      var req = this.req,
          server = this.server,
          readyStates = [],
          statuses = [];

      req.setUrl("/found");
      req.setMethod("GET");

      readyStates.push(req.getReadyState());
      req.addListener("readystatechange", function() {
        readyStates.push(req.getReadyState());
        statuses.push(req.getStatus());
      }, this);

      req.send();
      server.respond();

      this.assertArrayEquals([0, 1, 2, 3, 4], readyStates);
      this.assertArrayEquals([0, 0, 200, 200], statuses);
      this.assertEquals("text/html", req.getAllResponseHeaders()["content-type"]);
      this.assertEquals("text/html", req.getResponseHeader("Content-Type"));
      this.assertEquals("OK", req.getStatusText());
      this.assertEquals("FOUND", req.getResponseText());
    },

    //
    // Response
    //

    "test: get response": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport;

      transport.readyState = 4;
      transport.status = 200;
      transport.responseText = "Affe";
      transport.onreadystatechange();

      this.assertEquals("Affe", req.getResponse());
    },

    "test: get response by change event": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport,
          that = this;

      transport.readyState = 4;
      transport.status = 200;
      transport.responseText = "Affe";

      this.assertEventFired(req, "changeResponse", function() {
        transport.onreadystatechange();
      }, function(e) {
        that.assertEquals("Affe", e.getData());
      });

    },

    //
    // Parsing
    //

    "test: get parser": function() {
      var req = this.req;
      this.stub(req, "isDone").returns(true);
      this.stub(req, "getResponseContentType").returns("application/json");
      this.assertFunction(req._getParser());
    },

    "test: get parser prematurely": function() {
      var req = this.req;
      req._getParser();
    },

    "test: set parser function": function() {
      var req = this.req,
          parser = function() {};
      req.setParser(parser);
      this.stub(req, "getResponseContentType").returns("text/javascript");
      this.assertEquals(parser, req._getParser());
    },

    "test: set parser symbolically": function() {
      var req = this.req;
      req.setParser("json");
      this.assertFunction(req._getParser());
    },

    "test: parse json response": function() {
      this.setUpFakeServer();
      var req = this.req,
          server = this.server,
          that = this;

      this.stub(qx.io.request.Xhr.PARSER, "json");

      req.setUrl("/found.json");
      req.send();
      server.respond();

      this.assertCalledWith(qx.io.request.Xhr.PARSER.json, "JSON");
    },

    // XML

    respondXml: function(contentType) {
      this.setUpFakeXhr();
      var body = "XML: " + contentType;

      this.req.setUrl("/found.xml");
      this.req.send();
      this.getFakeReq().respond(200, {"Content-Type": contentType}, body);
    },

    "test: parse xml response": function() {
      this.stub(qx.io.request.Xhr.PARSER, "xml");
      this.respondXml("application/xml");
      this.assertCalledWith(qx.io.request.Xhr.PARSER.xml, "XML: application/xml");
    },

    "test: parse arbitrary xml response": function() {
      this.stub(qx.io.request.Xhr.PARSER, "xml");
      this.respondXml("animal/affe+xml");
      this.assertCalledWith(qx.io.request.Xhr.PARSER.xml, "XML: animal/affe+xml");
    },

    //
    // Auth
    //

    "test: basic auth": function() {
      this.setUpFakeTransport();

      var transport = this.transport,
          auth, call, key, credentials;

      auth = new qx.io.request.authentication.Basic();
      auth.setUsername("affe");
      auth.setPassword("geheim");
      this.req.setAuthentication(auth);
      this.req.send();

      call = transport.setRequestHeader.getCall(0);
      key = "Authorization";
      credentials = /Basic\s(.*)/.exec(call.args[1])[1];
      this.assertEquals(key, call.args[0]);
      this.assertEquals("affe:geheim", qx.util.Base64.decode(credentials));
    },

    //
    // Abort
    //

    "test: abort request": function() {
      this.setUpFakeTransport();
      this.req.abort();

      this.assertCalled(this.transport.abort);
    },

    getFakeReq: function() {
      return this.getRequests().slice(-1)[0];
    },

    noCache: function(url) {
      return qx.util.Uri.appendParamsToUrl(url, "nocache=" + Math.random());
    },

    respond: function(status, error) {
      var transport = this.transport;

      transport.status = status || 200;
      transport.readyState = 4;

      transport.onreadystatechange();
      error ? transport.onerror() : transport.onload();
      transport.onloadend();
    },

    respondError: function(status) {
      this.respond(status || 0, true);
    }
  }
});
