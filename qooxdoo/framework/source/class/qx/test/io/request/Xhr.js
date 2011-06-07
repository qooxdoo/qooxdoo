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

/**
 * Tests asserting behavior
 *
 * - special to io.request.Xhr and
 * - common to io.request.* (see {@link qx.test.io.request.MRequest})
 *
 * Tests defined in MRequest run with appropriate context, i.e.
 * a transport that is an instance of qx.bom.request.Xhr
 * (see {@link #setUpFakeTransport}).
 *
 */
qx.Class.define("qx.test.io.request.Xhr",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.test.io.MRemoteTest,
             qx.test.io.request.MRequest,
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
      this.transport = this.injectStub(qx.io.request.Xhr.prototype,
        "_createTransport", this.deepStub(new qx.bom.request.Xhr()));
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

    "test: progress phases": function() {
      var req = this.req,
          phases = [],
          expectedPhases = ["opened", "sent", "loading", "success"],
          url = this.getUrl("qx/test/xmlhttp/sample.txt");

      req.addListener("changePhase", function() {
        phases.push(req.getPhase());

        if (req.getPhase() === "success") {
          this.resume(function() {
            this.assertArrayEquals(expectedPhases, phases);
          }, this);
        }

      }, this);

      req.setUrl(url);
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
    // General (cont.)
    //

    "test: set url property on construct": function() {
      var req = new qx.io.request.Xhr("url");
      this.assertEquals("url", req.getUrl());
    },

    "test: set method property on construct": function() {
      var req = new qx.io.request.Xhr("url", "POST");
      this.assertEquals("POST", req.getMethod());
    },

    //
    // Send (cont.)
    //

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

    //
    // Data (cont.)
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
    // Header and Params (cont.)
    //

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
      req.addListener("readyStateChange", function() {
        readyStates.push(req.getReadyState());
        statuses.push(req.getStatus());
      }, this);

      req.send();
      server.respond();

      this.assertArrayEquals([0, 1, 2, 3, 4], readyStates);
      this.assertArrayEquals([0, 0, 200, 200], statuses);
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

    "test: getParser()": function() {
      var req = this.req;
      this.stub(req, "isDone").returns(true);
      this.stub(req, "getResponseContentType").returns("application/json");
      this.assertFunction(req._getParser());
    },

    "test: getParser() prematurely": function() {
      var req = this.req;
      req._getParser();
    },

    "test: setParser() function": function() {
      var req = this.req,
          parser = function() {};
      req.setParser(parser);
      this.stub(req, "getResponseContentType").returns("text/javascript");
      this.assertEquals(parser, req._getParser());
    },

    "test: setParser() symbolically": function() {
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

      auth = new qx.io.request.authentication.Basic("affe", "geheim");
      this.req.setAuthentication(auth);
      this.req.send();

      call = transport.setRequestHeader.getCall(0);
      key = "Authorization";
      credentials = /Basic\s(.*)/.exec(call.args[1])[1];
      this.assertEquals(key, call.args[0]);
      this.assertEquals("affe:geheim", qx.util.Base64.decode(credentials));
    }
  }
});
