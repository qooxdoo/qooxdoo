/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/* ************************************************************************
 ************************************************************************ */

/**
 * @ignore(Klass)
 * @asset(qx/test/xmlhttp/*)
 */

/* global Klass */
/**
 * Tests asserting shared behavior of io.request.* classes. Also provides
 * common helpers.
 *
 * It should be noted that tests defined here fake an ideal transport. The
 * transport itself is tested elsewhere (see {@link qx.test.bom.request}).
 */
qx.Mixin.define("qx.test.io.request.MRequest", {
  members: {
    setUpKlass() {
      qx.Class.define("Klass", {
        extend: qx.core.Object,

        properties: {
          affe: {
            init: true
          }
        }
      });
    },

    //
    // General
    //

    "test: dispose transport on destruct"() {
      this.req.dispose();

      this.wait(
        100,
        function () {
          this.assertCalled(this.transport.dispose);
        },
        this
      );
    },

    "test: getTransport()"() {
      this.assertEquals(this.transport, this.req.getTransport());
    },

    //
    // Send
    //

    "test: send() GET"() {
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url");
      this.assertCalled(this.transport.send);
    },

    "test: drop fragment from URL"() {
      this.req.setUrl("example.com#fragment");
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "example.com");
    },

    //
    // Abort
    //

    "test: abort request"() {
      this.req.abort();

      this.assertCalled(this.transport.abort);
    },

    //
    // Data
    //

    "test: not send data with GET request"() {
      this.req.setRequestData("str");
      this.req.send();

      this.assertCalledWith(this.transport.send);
    },

    "test: append string data to URL with GET request"() {
      this.req.setRequestData("str");
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url?str");
    },

    "test: append obj data to URL with GET request"() {
      this.req.setRequestData({ affe: true });
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url?affe=true");
    },

    "test: append qooxdoo obj data to URL with GET request"() {
      this.setUpKlass();
      var obj = new Klass();
      this.req.setRequestData(obj);
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url?affe=true");
      obj.dispose();
    },

    "test: append FormData to URL with POST request"() {
      if (!window.FormData) {
        this.skip("FormData API not supported");
      }

      if (!this.req.setMethod) {
        this.skip("POST requests not supported by this transport");
      }

      var formData = new FormData();
      formData.append("foo", "bar");
      formData.append("baz", "qux");

      this.req.setMethod("POST");
      this.req.setRequestData(formData);
      this.req.send();

      this.assertCalledWith(this.transport.send, formData);
    },

    //
    // Header and Params
    //

    "test: set request header"() {
      this.req.setRequestHeader("key", "value");
      this.req.send();

      this.assertCalledWith(this.transport.setRequestHeader, "key", "value");
    },

    "test: set request header does not append"() {
      var stub = this.transport.setRequestHeader.withArgs("key", "value");

      this.req.setRequestHeader("key", "value");
      this.req.setRequestHeader("key", "value");
      this.req.send();

      this.assertCalledOnce(stub.withArgs("key", "value"));
    },

    "test: get request header"() {
      this.req.setRequestHeader("key", "value");

      this.assertEquals("value", this.req.getRequestHeader("key"));
    },

    "test: remove request header"() {
      var stub;

      this.req.setRequestHeader("key", "value");
      this.req.removeRequestHeader("key");

      stub = this.transport.setRequestHeader.withArgs("key", "value");
      this.req.send();

      this.assertNotCalled(stub);
    },

    "test: get all request headers"() {
      this.req.setRequestHeader("key", "value");
      this.req.setRequestHeader("otherkey", "value");

      this.assertEquals("value", this.req._getAllRequestHeaders()["key"]);
      this.assertEquals("value", this.req._getAllRequestHeaders()["otherkey"]);
    },

    "test: get all request headers includes configuration dependent headers"() {
      this.req.setRequestHeader("key", "value");
      this.req._getConfiguredRequestHeaders = function () {
        return { otherkey: "value" };
      };

      this.assertEquals("value", this.req._getAllRequestHeaders()["key"]);
      this.assertEquals("value", this.req._getAllRequestHeaders()["otherkey"]);
    },

    "test: not append cache parameter to URL"() {
      this.req.send();

      var msg = "nocache parameter must not be set";
      this.assertFalse(/\?nocache/.test(this.transport.open.args[0][1]), msg);
    },

    "test: append nocache parameter to URL"() {
      this.req.setCache(false);
      this.req.send();

      var msg = "nocache parameter must be set to number";
      this.assertTrue(
        /\?nocache=\d{13,}/.test(this.transport.open.args[0][1]),
        msg
      );
    },

    //
    // Events
    //

    "test: fire readyStateChange"() {
      var req = this.req,
        readystatechange = this.spy();

      req.addListener("readyStateChange", readystatechange);
      this.respond();

      this.assertCalledOnce(readystatechange);
    },

    "test: fire success"() {
      var req = this.req,
        success = this.spy();

      req.addListener("success", success);
      this.respond();

      this.assertCalledOnce(success);
    },

    "test: not fire success on erroneous status"() {
      var req = this.req,
        success = this.spy();

      req.addListener("success", success);
      this.respond(500);

      this.assertNotCalled(success);
    },

    "test: fire load"() {
      var req = this.req,
        load = this.spy();

      req.addListener("load", load);
      this.respond();

      this.assertCalledOnce(load);
    },

    "test: fire loadEnd"() {
      var req = this.req,
        loadEnd = this.spy();

      req.addListener("loadEnd", loadEnd);
      this.respond();

      this.assertCalledOnce(loadEnd);
    },

    "test: fire abort"() {
      var req = this.req,
        abort = this.spy();

      req.addListener("abort", abort);
      this.transport.onabort();

      this.assertCalledOnce(abort);
    },

    "test: fire timeout"() {
      var req = this.req,
        transport = this.transport,
        timeout = this.spy();

      req.setTimeout(100);
      req.send();

      req.addListener("timeout", timeout);
      transport.ontimeout();

      this.assertEquals(100, transport.timeout);
      this.assertCalledOnce(timeout);
    },

    "test: fire error"() {
      var req = this.req,
        error = this.spy();

      req.addListener("error", error);
      this.respondError();

      this.assertCalledOnce(error);
    },

    "test: fire statusError"() {
      var req = this.req,
        statusError = this.spy();

      req.addListener("statusError", statusError);
      this.respond(500);

      this.assertCalledOnce(statusError);
    },

    "test: fire fail on erroneous status"() {
      var req = this.req,
        fail = this.spy();

      req.addListener("fail", fail);
      this.respond(500);

      this.assertCalledOnce(fail);
    },

    "test: fire fail on network error"() {
      var req = this.req,
        fail = this.spy();

      req.addListener("fail", fail);
      this.respondError();

      this.assertCalledOnce(fail);
    },

    "test: fire fail on timeout"() {
      var req = this.req,
        fail = this.spy();

      req.addListener("fail", fail);
      this.timeout();

      this.assertCalledOnce(fail);
    },

    "test: fire changePhase"() {
      var req = this.req,
        that = this;

      this.assertEventFired(
        req,
        "changePhase",
        function () {
          that.respond();
        },
        function (evt) {
          that.assertMatch(evt.getData(), "load|success");
        }
      );
    },

    //
    // Phase
    //

    "test: phase is unsent"() {
      this.assertEquals("unsent", this.req.getPhase());
    },

    "test: phase was open before send"() {
      var req = this.req,
        phases = [];

      req.addListener("changePhase", function () {
        phases.push(req.getPhase());
      });

      req.setUrl("/url");
      req.send();

      this.assertArrayEquals(["opened", "sent"], phases);
    },

    "test: phase is sent"() {
      var req = this.req;

      req.setUrl("/url");
      req.send();

      this.assertEquals("sent", req.getPhase());
    },

    "test: phase is loading"() {
      var req = this.req,
        transport = this.transport;

      transport.readyState = 3;
      transport.onreadystatechange();

      this.assertEquals("loading", req.getPhase());
    },

    "test: phase is load intermediately"() {
      var req = this.req,
        transport = this.transport,
        phases = [];

      req.addListener("changePhase", function () {
        phases.push(req.getPhase());
      });

      transport.readyState = 4;
      transport.onreadystatechange();

      // phases = ["load", "statusError"]
      this.assertEquals("load", phases[0]);
    },

    "test: phase is success"() {
      var req = this.req;

      this.respond();
      this.assertEquals("success", req.getPhase());
    },

    // Error handling

    "test: phase is statusError"() {
      var req = this.req;

      this.respond(500);
      this.assertEquals("statusError", req.getPhase());
    },

    "test: phase is abort"() {
      var req = this.req,
        transport = this.transport;

      req.abort();
      transport.onabort();

      // Transport switches to readyState DONE on abort
      transport.readyState = 4;
      transport.onreadystatechange();

      this.assertEquals("abort", req.getPhase());
    },

    "test: phase is abort when from cache"() {
      var req = this.req,
        transport = this.transport;

      req.abort();
      transport.onabort();

      // Synchronously served from cached
      transport.status = 304;

      // Transport switches to readyState DONE on abort
      transport.readyState = 4;
      transport.onreadystatechange();

      this.assertEquals("abort", req.getPhase());
    },

    "test: phase is abort on readyState DONE when aborted before"() {
      var req = this.req,
        transport = this.transport;

      req.addListener("readyStateChange", () => {
        if (req.getReadyState() == 4) {
          this.assertEquals("abort", req.getPhase());
        }
      });

      req.send();
      req.abort();

      // Transport switches to readyState DONE on abort
      transport.readyState = 4;
      transport.onreadystatechange();

      transport.onabort();
    },

    "test: phase is abort on readyState DONE when aborting loading"() {
      var req = this.req,
        transport = this.transport;

      req.addListener("readyStateChange", () => {
        if (req.getReadyState() == 4) {
          this.assertEquals("abort", req.getPhase());
        }
      });

      req.send();

      // Loading
      transport.readyState = 3;
      transport.onreadystatechange();

      // Abort loading
      req.abort();

      // Transport switches to readyState DONE on abort
      transport.readyState = 4;
      transport.onreadystatechange();
      transport.onabort();
    },

    "test: phase is abort on loadEnd when aborted before"() {
      var req = this.req,
        transport = this.transport;

      req.addListener("loadEnd", () => {
        this.assertEquals("abort", req.getPhase());
      });

      req.send();
      req.abort();

      // Transport fires "onloadend" on abort
      transport.readyState = 4;
      transport.onloadend();

      transport.onabort();
    },

    "test: phase is timeout"() {
      var req = this.req;

      this.timeout();
      this.assertEquals("timeout", req.getPhase());
    },

    getFakeReq() {
      return this.getRequests().slice(-1)[0];
    },

    noCache(url) {
      return qx.util.Uri.appendParamsToUrl(
        url,
        "nocache=" + new Date().valueOf()
      );
    },

    respond(status, error) {
      var transport = this.transport;

      transport.status = typeof status === "undefined" ? 200 : status;
      transport.readyState = 4;
      transport.onreadystatechange();

      (function () {
        if (error === "timeout") {
          transport.ontimeout();
          return;
        }

        if (error === "network") {
          transport.onerror();
          return;
        }

        transport.onload();
      })();

      transport.onloadend();
    },

    respondError() {
      this.respond(0, "network");
    },

    timeout() {
      this.respond(0, "timeout");
    }
  }
});
