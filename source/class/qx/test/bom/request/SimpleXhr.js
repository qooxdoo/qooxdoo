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

qx.Class.define("qx.test.bom.request.SimpleXhr",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.dev.unit.MMock],

  members :
  {
    setUp : function()
    {
      this.req = new qx.bom.request.SimpleXhr();
    },

    tearDown : function()
    {
      this.req = null;
      this.getSandbox().restore();
    },

    //
    // setRequestHeader()
    // getRequestHeader()
    //

    "test: set/get request header": function() {
      var key = "Accept",
          value = "application/json";

      this.assertEquals(value, this.req.setRequestHeader(key, value).getRequestHeader(key));
    },

    //
    // setUrl()
    // getUrl()
    //

    "test: set/get url": function() {
      var url = "http://example.org";

      this.assertEquals(url, this.req.setUrl(url).getUrl());
    },

    //
    // setMethod()
    // getMethod()
    //

    "test: set/get method": function() {
      var method = "GET";

      this.assertEquals(method, this.req.setMethod(method).getMethod());
    },

    //
    // setRequestData()
    // getRequestData()
    //

    "test: set/get request data": function() {
      var data = {"abc": "def", "uvw": "xyz"};

      this.assertEquals(data, this.req.setRequestData(data).getRequestData());
    },

    //
    // _setResponse()
    // getResponse()
    //

    "test: set/get response": function() {
      var req = this.req,
          json = '{"animals": ["monkey", "mouse"]}',
          xml = "<animals><monkey/><mouse/></animals>",
          obj = {a:"b"};

      req._transport.responseText = json;
      this.assertEquals(json, req.getResponse());

      req._transport.responseXML = xml;
      this.assertEquals(xml, req.getResponse());

      req._setResponse(obj);
      this.assertEquals(obj, req.getResponse());
    },

    //
    // setTimeout()
    // getTimeout()
    //

    "test: set/get timeout in millis": function() {
      this.assertEquals(150, this.req.setTimeout(150).getTimeout());
    },

    //
    //  useCaching
    //  isCaching
    //

    "test: use/is caching": function() {
      this.assertTrue(this.req.useCaching(true).isCaching());
      this.assertFalse(this.req.useCaching(false).isCaching());
    },

    //
    // setParser()
    //

    "test: set (custom) parser": function() {
      var req = this.req,
          acceptedParser = null,
          customParser = function() {};

      acceptedParser = req.setParser(customParser);
      this.assertEquals(customParser, acceptedParser);
    },

    //
    // _serializeData()
    //

    "test: serialize data": function() {
      var data = {"abc": "def", "uvw": "xyz"},
          contentType = "application/json";

      this.assertNull(this.req._serializeData(null));
      this.assertEquals("leaveMeIntact", this.req._serializeData("leaveMeIntact"));
      this.assertEquals("abc=def&uvw=xyz", this.req._serializeData(data));
      this.assertEquals("abc=def&uvw=xyz", this.req._serializeData(data, "arbitrary/contentType"));
      this.assertEquals('{"abc":"def","uvw":"xyz"}', this.req._serializeData(data, contentType));
      this.assertEquals('[1,2,3]', this.req._serializeData([1,2,3], contentType));
    },

    //
    // send()
    //

    stubTransportMethods : function(methods) {
      var stubbedTransport = this.req._createTransport(),
          l = methods.length;

      while (l--) {
        this.stub(stubbedTransport, methods[l]);
      }
      this.req._transport = stubbedTransport;
      return stubbedTransport;
    },

    "test: send() w/ timeout": function() {
      var req = this.req,
          method = "GET",
          url = "http://example.org",
          stubbedTransport = {};

      req.setUrl(url);
      req.setTimeout(150);
      stubbedTransport = this.stubTransportMethods(["open", "send"]);
      req.send();

      this.assertCalledWith(stubbedTransport.open, method, url, true);
      this.assertCalledWith(stubbedTransport.send);
      this.assertEquals(stubbedTransport.timeout, req.getTimeout());
    },

    "test: send() w/o data and w/o headers": function() {
      var req = this.req,
          method = "GET",
          url = "http://example.org",
          stubbedTransport = {};

      req.setUrl(url);
      stubbedTransport = this.stubTransportMethods(["open", "send"]);
      req.send();

      this.assertCalledWith(stubbedTransport.open, method, url, true);
      this.assertCalledWith(stubbedTransport.send);
    },

    "test: send() GET w/ data and w/ headers": function() {
      var req = this.req,
          method = "GET",
          url = "http://example.org",
          obj = {a:"b"},
          stubbedTransport = {};

      req.setUrl(url);
      req.setRequestHeader("Accept", "application/json");
      req.setRequestData(obj);
      stubbedTransport = this.stubTransportMethods(["open", "setRequestHeader", "send"]);
      req.send();

      this.assertCalledWith(stubbedTransport.open, method, url+"?a=b", true);
      this.assertCalledWith(stubbedTransport.setRequestHeader, "Accept", "application/json");
      this.assertCalledWith(stubbedTransport.send);
    },

    "test: send() GET w/ enabled caching sets nocache param": function() {
      var req = this.req,
          method = "GET",
          url = "http://example.org",
          expectedUrl = new RegExp(url+"\\?nocache=[0-9]{13,}"),
          stubbedTransport = {};

      req.setUrl(url);
      req.useCaching(false);
      stubbedTransport = this.stubTransportMethods(["open", "send"]);
      req.send();

      this.assertCalledWithMatch(stubbedTransport.open, method, expectedUrl, true);
      this.assertCalledWith(stubbedTransport.send);
    },

    "test: send() GET w/ caching header overrides cache prevention": function() {
      var req = this.req,
          method = "GET",
          url = "http://example.org",
          stubbedTransport = {};

      req.setUrl(url);
      req.setRequestHeader("Cache-Control", "no-cache");
      stubbedTransport = this.stubTransportMethods(["open", "setRequestHeader", "send"]);
      req.send();

      this.assertCalledWith(stubbedTransport.open, method, url, true);
      this.assertCalledWith(stubbedTransport.setRequestHeader, "Cache-Control", "no-cache");
      this.assertCalledWith(stubbedTransport.send);
    },

    "test: send() POST w/ data (default content-type)": function() {
      var req = this.req,
          method = "POST",
          url = "http://example.org",
          obj = {a:"b"},
          stubbedTransport = {};

      req.setUrl(url);
      req.setMethod(method);
      req.setRequestData(obj);
      stubbedTransport = this.stubTransportMethods(["open", "setRequestHeader", "send"]);
      req.send();

      this.assertCalledWith(stubbedTransport.open, method, url, true);
      this.assertCalledWith(stubbedTransport.setRequestHeader, "Content-Type", "application/x-www-form-urlencoded");
      this.assertCalledWith(stubbedTransport.send, "a=b");
    },

    "test: send() POST w/ data (application/json)": function() {
      var req = this.req,
          method = "POST",
          url = "http://example.org",
          obj = {a:"b"},
          stubbedTransport = {};

      req.setUrl(url);
      req.setMethod(method);
      req.setRequestData(obj);
      req.setRequestHeader("Content-Type", "application/json");
      stubbedTransport = this.stubTransportMethods(["open", "setRequestHeader", "send"]);
      req.send();

      this.assertCalledWith(stubbedTransport.open, method, url, true);
      this.assertCalledWith(stubbedTransport.send, qx.lang.Json.stringify(obj));
    },

    "test: send() POST w/ FormData": function() {
      var req = this.req,
        method = "POST",
        url = "http://example.org",
        stubbedTransport = {};

      if (!window.FormData) {
        this.skip("FormData API not supported");
      }

      if (!req.setMethod) {
        this.skip("POST requests not supported by this transport");
      }

      var formData = new FormData();
      formData.append("foo", "bar");
      formData.append("baz", "qux");

      req.setUrl(url);
      req.setMethod(method);
      req.setRequestData(formData);
      stubbedTransport = this.stubTransportMethods(["open", "setRequestHeader", "send"]);
      req.send();

      this.assertCalledWith(stubbedTransport.send, formData);
    },


    "test: send() POST w/ Blob": function() {
      var req = this.req,
        method = "POST",
        url = "http://example.org",
        stubbedTransport = {};

      if (!window.Blob) {
        this.skip("Blob API not supported");
      }

      if (!req.setMethod) {
        this.skip("POST requests not supported by this transport");
      }

      var blob = new window.Blob(['abc123'], {type: 'text/plain'});

      req.setUrl(url);
      req.setMethod(method);
      req.setRequestData(blob);
      stubbedTransport = this.stubTransportMethods(["open", "setRequestHeader", "send"]);
      req.send();

      this.assertCalledWith(stubbedTransport.send, blob);
    },

    "test: send() POST w/ ArrayBuffer": function() {
      var req = this.req,
        method = "POST",
        url = "http://example.org",
        stubbedTransport = {};

      if (!window.ArrayBuffer) {
        this.skip("ArrayBuffer API not supported");
      }

      if (!req.setMethod) {
        this.skip("POST requests not supported by this transport");
      }

      var arrayBuffer = new window.ArrayBuffer(512);

      req.setUrl(url);
      req.setMethod(method);
      req.setRequestData(arrayBuffer);
      stubbedTransport = this.stubTransportMethods(["open", "setRequestHeader", "send"]);
      req.send();

      this.assertCalledWith(stubbedTransport.send, arrayBuffer);
    },

    //
    // abort()
    //

    "test: abort() aborts transport": function() {
      var stubbedTransport = this.stubTransportMethods(["abort"]);
      this.req.abort();

      this.assertCalled(stubbedTransport.abort);
    },

    //
    // dispose()
    //

    "test: dispose() disposes transport": function() {
      this.assertTrue(this.req.dispose());
    },


    //
    // addListenerOnce()
    //

    "test: addListenerOnce() event handler": function() {
      var req = this.req,
          stubbedTransport = this.req._createTransport(),
          name = "test-success",
          listener = function() {},
          ctx = this;

      this.stub(req, "once");
      req._transport = stubbedTransport;

      req.addListenerOnce(name, listener, ctx);
      this.assertCalledWith(req.once, name, listener, ctx);
    },

    //
    // _onReadyStateChange()
    // __onReadyStateDone()
    //

    "test: _onReadyStateDone() success": function() {
      var req = this.req,
          json = '{"animals": ["monkey", "mouse"]}',
          obj = {animals: ["monkey", "mouse"]},
          contentType = "application/json",
          stubbedTransport = req._createTransport();

      // prep transport
      this.stub(req, "emit");
      this.stub(stubbedTransport, "getResponseHeader").returns(contentType);
      req._transport = req._registerTransportListener(stubbedTransport);
      req._transport.readyState = qx.bom.request.Xhr.DONE;
      req._transport.responseText = json;
      req._transport.status = 200;

      req._transport.onreadystatechange();

      this.assertArrayEquals(obj.animals, req.getResponse().animals);
      this.assertCalledWith(req.emit, "success");
    },

    "test: _onReadyStateDone() fail w/ response": function() {
      var req = this.req,
          json = '{"animals": ["monkey", "mouse"]}',
          obj = {animals: ["monkey", "mouse"]},
          contentType = "application/json",
          stubbedTransport = req._createTransport();

      // prep transport
      this.stub(req, "emit");
      this.stub(stubbedTransport, "getResponseHeader").returns(contentType);
      req._transport = req._registerTransportListener(stubbedTransport);
      req._transport.readyState = qx.bom.request.Xhr.DONE;
      req._transport.responseText = json;
      req._transport.status = 404;

      req._transport.onreadystatechange();

      this.assertArrayEquals(obj.animals, req.getResponse().animals);
      this.assertCalledWith(req.emit, "fail");
    },

    "test: _onReadyStateDone() fail w/o response": function() {
      var req = this.req,
          contentType = "hasToExist/ButContentDoesntMatter",
          stubbedTransport = req._createTransport();

      // prep transport
      this.stub(req, "emit");
      this.stub(stubbedTransport, "getResponseHeader").returns(contentType);
      req._transport = req._registerTransportListener(stubbedTransport);
      req._transport.readyState = qx.bom.request.Xhr.DONE;
      req._transport.status = 404;

      req._transport.onreadystatechange();

      this.assertEquals("", req.getResponse());
      this.assertCalledWith(req.emit, "fail");
    },

    //
    // onLoadEnd()
    //

    "test: onLoadEnd()": function() {
      var req = this.req,
          stubbedTransport = req._createTransport();

      // prep transport
      this.stub(req, "emit");
      req._transport = req._registerTransportListener(stubbedTransport);

      req._transport.onloadend();

      this.assertCalledWith(req.emit, "loadEnd");
    },

    //
    // onAbort()
    //

    "test: onAbort()": function() {
      var req = this.req,
          stubbedTransport = req._createTransport();

      // prep transport
      this.stub(req, "emit");
      req._transport = req._registerTransportListener(stubbedTransport);

      req._transport.onabort();

      this.assertCalledWith(req.emit, "abort");
    },

    //
    // onTimeout()
    //

    "test: onTimeout()": function() {
      var req = this.req,
          stubbedTransport = req._createTransport();

      // prep transport
      this.stub(req, "emit");
      req._transport = req._registerTransportListener(stubbedTransport);

      req._transport.ontimeout();

      this.assertCalledWith(req.emit, "timeout");
      this.assertEquals(2, req.emit.callCount); // + emit("fail")
    },

    //
    // onError()
    //

    "test: onError()": function() {
      var req = this.req,
          stubbedTransport = req._createTransport();

      // prep transport
      this.stub(req, "emit");
      req._transport = req._registerTransportListener(stubbedTransport);

      req._transport.onerror();

      this.assertCalledWith(req.emit, "error");
      this.assertEquals(2, req.emit.callCount); // + emit("fail")
    },


    testGetResponseHeaders: function() {
      this.useFakeServer();
      this.getServer().autoRespond = true;
      this.getServer().respondWith("GET", "/foo",
        [
          200,
          {
            "x-affe": "AFFE"
          },
          "Response Body"
        ]);

      var req = new qx.bom.request.SimpleXhr('/foo', 'GET');
      req.on("success", function() {
        this.resume(function() {
          this.assertEquals("AFFE", req.getResponseHeader("x-affe"));
          var headers = req.getAllResponseHeaders();
          this.assertMatch(headers, /x-affe.*?AFFE/);
        }.bind(this));
      }.bind(this));

      window.setTimeout(function() {
        req.send();
      }, 100);

      this.wait(200);
    }
  }
});
