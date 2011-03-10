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

qx.Class.define("qx.test.bom.request.XhrTest",
{
  extend : qx.dev.unit.TestCase,

  include : qx.dev.unit.MMock,

  statics :
  {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4
  },

  members :
  {
    /**
     * The faked XMLHttpRequest.
     */
    fakedXhr: null,

    /**
     * Tracks the instance created with the faked XMLHttpRequest.
     */
    fakeReqs: null,

    /**
     * The request to test.
     */
    req: null,

    setUp : function()
    {
      this.req = new qx.bom.request.Xhr();
    },

    "test: should create instance": function() {
      this.assertObject(this.req);
    },

    "test: should detect native XHR": function() {
      var nativeXhr = this.req._getNativeXhr();

      this.assertObject(nativeXhr);
      this.assertNotNull(nativeXhr.readyState);
    },

    "test: should prepare request": function() {
      this.fakeNativeXhr();
      var req = this.req;

      var fakeReq = this.fakeReqs[0];
      this.spy(fakeReq, "open");

      var url = "/foo";
      var method = "GET";
      req.open(method, url);

      this.assertCalledWith(fakeReq.open, method, url);
    },

    // BUGFIX
    "test: should send request without data": function() {
      this.fakeNativeXhr();
      var req = this.req;

      var fakeReq = this.fakeReqs[0];
      this.spy(fakeReq, "send");

      req.open("GET", "/affe");
      req.send();

      this.assertCalledWith(fakeReq.send, null);
    },

    "test: should send request with data": function() {
      this.fakeNativeXhr();
      var req = this.req;

      var fakeReq = this.fakeReqs[0];
      this.spy(fakeReq, "send");

      var data = "AFFE";
      req.open("GET", "/affe");
      req.send(data);

      this.assertCalledWith(fakeReq.send, data);
    },

    "test: should call onreadystatechange on state change": function() {
      this.fakeNativeXhr();
      var req = this.req;
      var fakeReq = this.fakeReqs[0];
      this.spy(req, "onreadystatechange");

      // Simulate response.
      //
      // Iterates readyStates:
      // - HEADERS_RECEIVED
      // - LOADING
      // - DONE
      fakeReq.respond(this.constructor.DONE);

      this.assertCallCount(req.onreadystatechange, 3);
    },

    // BUGFIX
    "test: should ignore onreadystatechange when state is unchanged": function() {
      this.fakeNativeXhr();
      var req = this.req;
      var fakeReq = this.fakeReqs[0];
      this.spy(req, "onreadystatechange");

      req.readyState = this.constructor.OPENED;
      fakeReq.onreadystatechange();
      fakeReq.onreadystatechange();

      this.assertCalledOnce(req.onreadystatechange);
    },

    "test: should set readyState appropriate to current state": function() {
      this.fakeNativeXhr();
      var req = this.req;
      var fakeReq = this.fakeReqs[0];

      // Created
      this.assertEquals(this.constructor.UNSENT, req.readyState);

      // Open
      req.open("GET", "/affe");
      this.assertEquals(this.constructor.OPENED, req.readyState);

      // Send (and receive)
      req.send();
      fakeReq.respond(this.constructor.DONE);
      this.assertEquals(this.constructor.DONE, req.readyState);
    },

    "test: responseText should be empty string when open": function() {
      this.fakeNativeXhr();
      var req = this.req;

      // Open
      req.open("GET", "/affe");
      this.assertIdentical("", req.responseText);
    },

    "test: responseText should be empty string when reopend": function() {
      this.fakeNativeXhr();

      // Send, then reopen
      var req = this.req;
      req.open("GET", "/affe");
      req.send();
      req.open("GET", "/elefant");
      this.assertIdentical("", req.responseText);
    },

    "test: responseText should be populated when successful": function() {
      this.fakeNativeXhr();
      var req = this.req;
      var fakeReq = this.fakeReqs[0];

      var url = "/affe";
      var method = "GET";
      req.open(method, url);
      req.send();
      fakeReq.setResponseHeaders({});
      fakeReq.setResponseBody("Affe");

      this.assertEquals("Affe", req.responseText);
    },

    // BUGFIX
    "test: should query responseText when available": function() {
      this.fakeNativeXhr();
      var that = this;
      var req = this.req;
      var fakeReq = this.fakeReqs[0];

      function success(state) {
        // Create fake request
        req.open("GET", "/affe");

        // Stub and prepare success
        fakeReq.readyState = state;
        fakeReq.responseText = "YIPPIE";

        // Trigger readystatechange handler
        fakeReq.onreadystatechange();

        that.assertEquals("YIPPIE", req.responseText,
                          "When readyState is " + state);
      }

      // Assert responseText to be set while LOADING
      // in browsers other than IE < 7
      if (!this.__isIEBelow(7)) {
        success(this.constructor.LOADING);
      }
      success(this.constructor.DONE);

    },

    // BUGFIX
    "test: should not query responseText if unavailable": function() {
      this.fakeNativeXhr();
      var that = this;
      var req = this.req;
      var fakeReq = this.fakeReqs[0];

      function trap(state) {
        // Create fake request
        req.open("GET", "/affe");

        // Stub and set trap
        fakeReq.readyState = state;
        fakeReq.responseText = "BOGUS";

        // Trigger readystatechange handler
        fakeReq.onreadystatechange();

        that.assertNotEquals("BOGUS", req.responseText,
                             "When readyState is " + state);
      }

      trap(this.constructor.UNSENT);
      trap(this.constructor.OPENED);
      trap(this.constructor.HEADERS_RECEIVED);

      if (this.__isIEBelow(7)) {
        trap(this.constructor.LOADING);
      }

    },

    fakeNativeXhr: function() {
      var fakeReqs = this.fakeReqs = [];
      this.fakedXhr = this.useFakeXMLHttpRequest();
      this.fakedXhr.onCreate = function(xhr) {
        fakeReqs.push(xhr);
      };

      // Reset request so that it uses the faked XHR
      this.req = new qx.bom.request.Xhr();
    },

    __isIEBelow: function(version) {
      var Browser = qx.bom.client.Browser;
      return Browser.NAME == "ie" && Browser.VERSION < version;
    },

    tearDown : function()
    {
      this.req = null;

      // Restore native XMLHttpRequest
      if (this.fakedXhr) {
        this.fakedXhr.restore();
        this.fakedXhr = null;
      }

      // Empty request queue
      this.fakeReqs = [];
    }

  }
});
