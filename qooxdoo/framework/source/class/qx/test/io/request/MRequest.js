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
#asset(qx/test/xmlhttp/*)
************************************************************************ */

/**
 * @lint ignoreUndefined(Klass)
 */

/**
 * Tests asserting shared behavior of io.request.* classes. Also provides
 * common helpers.
 *
 * It should be noted that tests defined here fake an ideal transport. The
 * transport itself is tested elsewhere (see {@link qx.test.bom.request}).
 */
qx.Mixin.define("qx.test.io.request.MRequest",
{

  members :
  {

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

    //
    // General
    //

    "test: dispose transport on destruct": function() {
      this.setUpFakeTransport();
      this.req.dispose();

      this.assertCalled(this.transport.dispose);
    },

    "test: getTransport()": function() {
      this.setUpFakeTransport();
      this.assertEquals(this.transport, this.req.getTransport());
    },

    //
    // Send
    //

    "test: send() GET": function() {
      this.setUpFakeTransport();
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url");
      this.assertCalled(this.transport.send);
    },

    "test: drop fragment from URL": function() {
      this.setUpFakeTransport();
      this.req.setUrl("example.com#fragment");
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "example.com");
    },

    //
    // Abort
    //

    "test: abort request": function() {
      this.setUpFakeTransport();
      this.req.abort();

      this.assertCalled(this.transport.abort);
    },

    //
    // Data
    //

    "test: not send data with GET request": function() {
      this.setUpFakeTransport();
      this.req.setRequestData("str");
      this.req.send();

      this.assertCalledWith(this.transport.send, undefined);
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
      obj.dispose();
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

    //
    // Events
    //

    "test: fire readyStateChange": function() {
      this.setUpFakeTransport();
      var req = this.req,
          readystatechange = this.spy();

      req.addListener("readyStateChange", readystatechange);
      this.respond();

      this.assertCalledOnce(readystatechange);
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

    "test: fire loadEnd": function() {
      this.setUpFakeTransport();
      var req = this.req,
          loadEnd = this.spy();

      req.addListener("loadEnd", loadEnd);
      this.respond();

      this.assertCalledOnce(loadEnd);
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

    "test: fire statusError": function() {
      this.setUpFakeTransport();
      var req = this.req,
          statusError = this.spy();

      req.addListener("statusError", statusError);
      this.respond(500);

      this.assertCalledOnce(statusError);
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
      this.respondError();

      this.assertCalledOnce(fail);
    },

    "test: fire changePhase": function() {
      this.setUpFakeTransport();
      var req = this.req,
          that = this;

      this.assertEventFired(req, "changePhase", function() {
        that.respond();
      }, function(evt) {
        that.assertMatch(evt.getData(), "load|success");
      });
    },

    //
    // Phase
    //

    "test: phase is unsent": function() {
      this.assertEquals("unsent", this.req.getPhase());
    },

    "test: phase was open before send": function() {
      this.setUpFakeTransport();
      var req = this.req,
          phases = [];

      req.addListener("changePhase", function() {
        phases.push(req.getPhase());
      });

      req.setUrl("/url");
      req.send();

      this.assertArrayEquals(["opened", "sent"], phases);
    },

    "test: phase is sent": function() {
      this.setUpFakeTransport();
      var req = this.req;

      req.setUrl("/url");
      req.send();

      this.assertEquals("sent", req.getPhase());
    },

    "test: phase is loading": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport;

      transport.readyState = 3;
      transport.onreadystatechange();

      this.assertEquals("loading", req.getPhase());
    },

    "test: phase is load intermediately": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport,
          phases = [];

      req.addListener("changePhase", function() {
        phases.push(req.getPhase());
      });

      transport.readyState = 4;
      transport.onreadystatechange();

      // phases = ["load", "statusError"]
      this.assertEquals("load", phases[0]);
    },

    "test: phase is success": function() {
      this.setUpFakeTransport();
      var req = this.req;

      this.respond();
      this.assertEquals("success", req.getPhase());
    },

    // Error handling

    "test: phase is statusError": function() {
      this.setUpFakeTransport();
      var req = this.req;

      this.respond(500);
      this.assertEquals("statusError", req.getPhase());
    },

    "test: phase is abort": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport;

      req.abort();
      transport.onabort();

      // Transport switches to readyState DONE on abort
      transport.readyState = 4;
      transport.onreadystatechange();

      this.assertEquals("abort", req.getPhase());
    },

    "test: phase is abort when from cache": function() {
      this.setUpFakeTransport();
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

    "test: phase is abort on readyState DONE when aborted before": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport;

      req.addListener("readyStateChange", function() {
        if (req.getReadyState() == 4) {
          this.assertEquals("abort", req.getPhase());
        }
      }, this);

      req.send();
      req.abort();

      // Transport switches to readyState DONE on abort
      transport.readyState = 4;
      transport.onreadystatechange();

      transport.onabort();
    },

    "test: phase is abort on readyState DONE when aborting loading": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport;

      req.addListener("readyStateChange", function() {
        if (req.getReadyState() == 4) {
          this.assertEquals("abort", req.getPhase());
        }
      }, this);

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

    "test: phase is abort on loadEnd when aborted before": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport;

      req.addListener("loadEnd", function() {
        this.assertEquals("abort", req.getPhase());
      }, this);

      req.send();
      req.abort();

      // Transport fires "onloadend" on abort
      transport.readyState = 4;
      transport.onloadend();

      transport.onabort();
    },

    "test: phase is timeout": function() {
      this.setUpFakeTransport();
      var req = this.req,
          transport = this.transport;

      transport.ontimeout();
      this.assertEquals("timeout", req.getPhase());
    },

    getFakeReq: function() {
      return this.getRequests().slice(-1)[0];
    },

    noCache: function(url) {
      return qx.util.Uri.appendParamsToUrl(url, "nocache=" + (new Date).valueOf());
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
