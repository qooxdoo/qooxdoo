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

  include : [qx.test.io.request.MRequest,
             qx.dev.unit.MMock,
             qx.dev.unit.MRequirements],

  members :
  {
    setUp: function() {
      this.setUpRequest();
      this.setUpFakeTransport();
    },

    setUpRequest: function() {
      this.req && this.req.dispose();
      this.req = new qx.io.request.Xhr();
      this.req.setUrl("url");
    },

    setUpFakeTransport: function() {
      if (this.transport && this.transport.send.restore) { return; }
      this.transport = this.injectStub(qx.io.request.Xhr.prototype, "_createTransport");
      this.setUpRequest();
    },

    setUpFakeServer: function() {
      // Not fake transport
      this.getSandbox().restore();

      this.useFakeServer();
      this.setUpRequest();

      this.server = this.getServer();

      this.server.respondWith("GET", "/found",
        [200, {"Content-Type": "text/html"}, "FOUND"]);

      this.server.respondWith("GET", "/found.json",
        [200, {"Content-Type": "application/json; charset=utf-8"}, "JSON"]);

      this.server.respondWith("GET", "/found.other",
        [200, {"Content-Type": "application/other"}, "OTHER"]);
    },

    setUpFakeXhr: function() {
      // Not fake transport
      this.getSandbox().restore();

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
    // General (cont.)
    //

    "test: set url property on construct": function() {
      var req = new qx.io.request.Xhr("url");
      this.assertEquals("url", req.getUrl());
      req.dispose();
    },

    "test: set method property on construct": function() {
      var req = new qx.io.request.Xhr("url", "POST");
      this.assertEquals("POST", req.getMethod());
      req.dispose();
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

    "test: set content type urlencoded for POST request with body when no type given": function() {
      this.setUpFakeTransport();
      this.req.setMethod("POST");
      this.req.setRequestData("Affe");
      this.req.send();

      this.assertCalledWith(this.transport.setRequestHeader,
           "Content-Type", "application/x-www-form-urlencoded");
    },

    "test: not set content type urlencoded for POST request with body when type given": function() {
      var msg;

      this.setUpFakeTransport();
      this.req.setMethod("POST");
      this.req.setRequestData("Affe");
      this.req.setRequestHeader("Content-Type", "application/json");
      this.req.send();

      msg = "Must not set content type urlencoded when other type given";
      this.assert(!this.transport.setRequestHeader.calledWith("Content-Type",
        "application/x-www-form-urlencoded"), msg);
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
      obj.dispose();
    },

    //
    // Header and Params (cont.)
    //

    "test: set requested-with header": function() {
      this.setUpFakeTransport();
      this.req.send();

      this.assertCalledWith(this.transport.setRequestHeader, "X-Requested-With", "XMLHttpRequest");
    },

    "test: not set requested-with header when cross-origin": function() {
      this.setUpFakeTransport();
      var spy = this.transport.setRequestHeader.withArgs("X-Requested-With", "XMLHttpRequest");

      this.req.setUrl("http://example.com");
      this.req.send();

      this.assertNotCalled(spy);
    },

    "test: set cache control header": function() {
      this.setUpFakeTransport();
      this.req.setCache("no-cache");
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

    __assertParser: function(contentType, parser) {
      var req = this.req;

      this.stub(req, "isDone").returns(true);
      this.stub(req, "getResponseContentType").returns(contentType);

      var msg = "Content type '" + contentType + "' handled incorrectly";
      this.assertEquals(parser, req._getParser(), msg);

      req.isDone.restore();
      req.getResponseContentType.restore();
    },

    "test: getParser() returns silently when not DONE": function() {
      var req = this.req;
      req._getParser();
    },

    "test: getParser() returns undefined for unknown": function() {
      this.__assertParser("text/html", undefined);
      this.__assertParser("application/pdf", undefined);
    },

    "test: getParser() returns undefined for malformed": function() {
      this.__assertParser("", undefined);
      this.__assertParser("json", undefined);
      this.__assertParser("text/foo+json", undefined);
      this.__assertParser("application/foo+jsonish", undefined);
      this.__assertParser("application/foo+xmlish", undefined);
    },

    "test: getParser() detects json": function() {
      var json = qx.io.request.Xhr.PARSER["json"];
      this.__assertParser("application/json", json);
      this.__assertParser("application/vnd.affe+json", json);
      this.__assertParser("application/prs.affe+json", json);
      this.__assertParser("application/vnd.oneandone.onlineoffice.email+json", json);
    },

    "test: getParser() detects xml": function() {
      var xml = qx.io.request.Xhr.PARSER["xml"];
      this.__assertParser("application/xml", xml);
      this.__assertParser("application/vnd.oneandone.domains.domain+xml", xml);
      this.__assertParser("text/xml");  // Deprecated
    },

    "test: getParser() detects deprecated xml": function() {
      var xml = qx.io.request.Xhr.PARSER["xml"];
      this.__assertParser("text/xml");
    },

    "test: getParser() handles character set": function() {
      var json = qx.io.request.Xhr.PARSER["json"];
      this.__assertParser("application/json; charset=utf-8", json);
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

    "test: not parse empty response": function() {
      this.setUpFakeXhr();

      var req = this.req,
          parser = this.spy();

      req.send();
      this.stub(req, "_getParser").returns(parser);
      this.getFakeReq().respond(200, {}, "");

      this.assertNotCalled(parser);
    },

    "test: not parse unknown response": function() {
      this.setUpFakeServer();
      var req = this.req,
          server = this.server,
          that = this;

      req.setUrl("/found.other");
      req.send();
      server.respond();

      this.assertNull(req._getParser());
    },

    // JSON

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
      this.stub(qx.io.request.Xhr.PARSER, "xml");
      var body = "XML: " + contentType;

      this.req.setUrl("/found.xml");
      this.req.send();
      this.getFakeReq().respond(200, {"Content-Type": contentType}, body);
    },

    "test: parse xml response": function() {
      this.respondXml("application/xml");
      this.assertCalledWith(qx.io.request.Xhr.PARSER.xml, "XML: application/xml");
    },

    "test: parse arbitrary xml response": function() {
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

      call = transport.setRequestHeader.getCall(1);
      key = "Authorization";
      credentials = /Basic\s(.*)/.exec(call.args[1])[1];
      this.assertEquals(key, call.args[0]);
      this.assertEquals("affe:geheim", qx.util.Base64.decode(credentials));
    }
  }
});
