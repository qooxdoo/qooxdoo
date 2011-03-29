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

/**
 * @lint ignoreUndefined(Klass)
 */
qx.Class.define("qx.test.io.request.Xhr",
{
  extend : qx.dev.unit.TestCase,

  include : qx.dev.unit.MMock,

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
      this.server.respondWith("GET", "/found", [200, {}, "FOUND"]);
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

      qx.Class.undefine("Klass");
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

    //
    // Send
    //

    "test: should send GET request": function() {
      this.setUpFakeTransport();
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url", true);
      this.assertCalled(this.transport.send);
    },

    "test: should send sync request": function() {
      this.setUpFakeTransport();
      this.req.setAsync(false);
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url", false);
    },

    "test: should send POST request": function() {
      this.setUpFakeTransport();
      this.req.setMethod("POST");
      this.req.send();

      this.assertCalledWith(this.transport.open, "POST");
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

    // "test: should fire success": function() {
    //   this.useFakeServer();
    //   var server = this.getServer();
    //   server.respondWith("GET", "found", [200, {}, "FOUND"]);
    //
    //   var req = this.req;
    //   req.setUrl("found");
    //   req.setMethod("GET");
    //   this.assertEventFired(req, "success", function() {
    //     req.send();
    //   });
    // },

    //
    // Abort
    //

    "test: should abort request": function() {
      this.setUpFakeTransport();
      this.req.abort();

      this.assertCalled(this.transport.abort);
    }
  }
});
