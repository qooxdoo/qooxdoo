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
      this.spy(this.transport, "open");
      this.spy(this.transport, "setRequestHeader");
      this.spy(this.transport, "send");
      this.spy(this.transport, "abort");
      this.stub(qx.io.request.Xhr.prototype, "_createTransport").
          returns(this.transport);

      this.setUpRequest();
    },

    setUpFakeServer: function() {
      this.useFakeServer();
      this.setUpRequest();

      this.server = this.getServer();
      this.server.respondWith("GET", "/found", [200, {"Content-Type": "text/html"}, "FOUND"]);
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
      try { qx.Class.undefine("Klass"); } catch(e) {};
    },

    //
    // Full stack tests
    //

    "test: should fetch resource": function() {
      // TODO: Adjust URL when file://
      this.require(["http"]);

      var req = new qx.io.request.Xhr(),
          url = this.noCache(this.getUrl("qx/test/xmlhttp/sample.txt"));

      req.addListener("success", function() {
        this.resume(function() {
          this.assertEquals("SAMPLE", req.getResponseText());
        }, this);
      }, this);

      req.setUrl(url);
      req.send();

      this.wait();
    },

    //
    // General
    //

    "test: should dispose transport on destruct": function() {
      this.setUpFakeTransport();
      this.spy(this.transport, "dispose");
      this.req.dispose();

      this.assertCalled(this.transport.dispose);
    },

    //
    // Helper
    //

    "test: should append data to URL": function() {
      var url = "http://example.com/path";
      var data = "affe=true&maus=false";

      var expected = "http://example.com/path?affe=true&maus=false";
      var result = qx.io.request.Xhr.appendDataToUrl(url, data);
      this.assertEquals(expected, result);
    },

    "test: should append data to URL with query string": function() {
      var url = "http://example.com/path?giraffe=true";
      var data = "affe=true&maus=false";

      var expected = "http://example.com/path?giraffe=true&affe=true&maus=false";
      var result = qx.io.request.Xhr.appendDataToUrl(url, data);
      this.assertEquals(expected, result);
    },

    "test: should indicate success": function() {
      this.setUpFakeTransport();
      var isSuccessful = qx.lang.Function.bind(this.req.isSuccessful, this.req);

      this.transport.status = 200;
      this.assertTrue(isSuccessful());

      this.transport.status = 304;
      this.assertTrue(isSuccessful());

      this.transport.status = 404;
      this.assertFalse(isSuccessful());

      this.transport.status = 500;
      this.assertFalse(isSuccessful());
    },

    //
    // Send
    //

    "test: should send GET request": function() {
      this.setUpFakeTransport();
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url", true);
      this.assertCalled(this.transport.send);
    },

    "test: should send POST request": function() {
      this.setUpFakeTransport();
      this.req.setMethod("POST");
      this.req.send();

      this.assertCalledWith(this.transport.open, "POST");
    },

    "test: should send sync request": function() {
      // TODO: Firefox: "Access to restricted URI denied"
      this.require(["http"]);

      this.setUpFakeTransport();
      this.req.setAsync(false);
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url", false);
      this.assertCalled(this.transport.send);
    },

    "test: should send authorized request": function() {
      this.setUpFakeTransport();
      this.req.setUsername("affe");
      this.req.setPassword("geheim");
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url", true, "affe", "geheim");
    },

    "test: should drop fragment from URL": function() {
      this.setUpFakeTransport();
      this.req.setUrl("example.com#fragment")
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "example.com");
    },

    //
    // Data with GET
    //

    "test: should not send data with GET request": function() {
      this.setUpFakeTransport();
      this.req.setData("str");
      this.req.send();

      this.assertCalledWith(this.transport.send, null);
    },

    "test: should append string data to URL with GET request": function() {
      this.setUpFakeTransport();
      this.req.setData("str");
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url?str");
    },

    "test: should append obj data to URL with GET request": function() {
      this.setUpFakeTransport();
      this.req.setData({affe: true});
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url?affe=true");
    },

    "test: should append qooxdoo obj data to URL with GET request": function() {
      this.setUpFakeTransport();
      this.setUpKlass();
      var obj = new Klass();
      this.req.setData(obj);
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url?affe=true");
    },

    //
    // Data with POST
    //

    "test: should set content type urlencoded for POST request": function() {
      this.setUpFakeTransport();
      this.req.setMethod("POST");
      this.req.send();

      this.assertCalledWith(this.transport.setRequestHeader,
           "Content-type", "application/x-www-form-urlencoded");
    },

    "test: should send string data with POST request": function() {
      this.setUpFakeTransport();
      this.req.setMethod("POST");
      this.req.setData("str");
      this.req.send();

      this.assertCalledWith(this.transport.send, "str");
    },

    "test: should send obj data with POST request": function() {
      this.setUpFakeTransport();
      this.req.setMethod("POST");
      this.req.setData({"af fe": true});
      this.req.send();

      this.assertCalledWith(this.transport.send, "af+fe=true");
    },

    "test: should send qooxdoo obj data with POST request": function() {
      this.setUpFakeTransport();
      this.setUpKlass();
      var obj = new Klass();
      this.req.setMethod("POST");
      this.req.setData(obj);
      this.req.send();

      this.assertCalledWith(this.transport.send, "affe=true");
    },

    //
    // Header
    //

    "test: should set request headers": function() {
      this.setUpFakeTransport();
      this.req.setRequestHeaders({key1: "value", key2: "value"});
      this.req.send();

      this.assertCalledWith(this.transport.setRequestHeader, "key1", "value");
      this.assertCalledWith(this.transport.setRequestHeader, "key2", "value");
    },

    //
    // Events
    //

    "test: should fire multiple readystatechange": function() {
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

    "test: should fire success": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport;

      this.assertEventFired(req, "success", function() {
        transport.readyState = 4;
        transport.status = 200;
        transport.onreadystatechange();
      });
    },

    "test: should not fire success": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport;

      this.assertEventNotFired(req, "success", function() {
        transport.status = 200;
        transport.onreadystatechange();
      });
    },

    "test: should fire load": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport;

      this.assertEventFired(req, "load", function() {
        transport.onload();
      });
    },

    "test: should fire loadend": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport;

      this.assertEventFired(req, "loadend", function() {
        transport.onloadend();
      });
    },

    "test: should fire error": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport;

      this.assertEventFired(req, "error", function() {
        transport.onerror();
      });
    },

    //
    // Properties
    //

    "test: should sync XHR properties for every readyState": function() {
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
    // Abort
    //

    "test: should abort request": function() {
      this.setUpFakeTransport();
      this.req.abort();

      this.assertCalled(this.transport.abort);
    },

    noCache: function(url) {
      return url + "?nocache=" + Math.random();
    }
  }
});
