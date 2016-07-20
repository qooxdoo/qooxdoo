

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

/* ************************************************************************


************************************************************************ */
/**
 *
 * @asset(qx/test/webworker.js)
 */

qx.Class.define("qx.test.bom.WebWorker",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    _url: null,
    _worker: null,
    _send: null,

    /*
     * Firefox 8+ throws an exception ("Could not get domain") when trying
     * to create a worker using a source URI that doesn't contain a TLD, e.g.
     * "localhost" or an IP address.
     *
     * http://bugzilla.qooxdoo.org/show_bug.cgi?id=5565
     * https://bugzilla.mozilla.org/show_bug.cgi?id=683280
     */
    _isBuggyGecko : function()
    {
      return qx.core.Environment.get("engine.name") === "gecko" &&
        parseInt(qx.core.Environment.get("engine.version"), 10) >= 8 &&
        parseInt(qx.core.Environment.get("engine.version"), 10) < 9;
    },

    setUp: function() {
      this._url = qx.util.ResourceManager.getInstance().toUri("qx/test/webworker.js");

      if (this._isBuggyGecko()) {
        throw new qx.dev.unit.RequirementError("foo", "Test skipped due to Firefox bug #683280");
      }

      this._worker = new qx.bom.WebWorker(this._url);

      this._send = function(message, fn) {
        this._worker.addListener("message", function(e) {
          this.assertType(e.getData(), typeof message);
          fn.call(this, message, e);
        }, this);
        this._worker.postMessage(message);
      };
    },

    tearDown: function() {
      this._worker.dispose();
      this._worker = null;
      this._send = null;
      this._url = null;
    },

    testConstructor: function() {
      this.assertInstance(this._worker, qx.bom.WebWorker);
    },

    testMessageEvent: function() {
      this._send("message", function(mess, e) {
        this.assertIdentical(mess, e.getData());
      });
    },

    testErrorEvent: function() {
      var message = "error";

      this._worker.addListener("error", function(e) {
        this.assertTrue(/error/.test(e.getData()));
      }, this);
      this._worker.postMessage(message);
    },

    testPostMessageWithNumber: function() {
      this._send(1, function(mess, e) {
        this.assertIdentical(mess, e.getData());
      });
    },

    testPostMessageWithBoolean: function() {
      this._send(true, function(mess, e) {
        this.assertIdentical(mess, e.getData());
      });
    },

    testPostMessageWithNull: function() {
      this._send(null, function(mess, e) {
        this.assertIdentical(mess, e.getData());
      });
    },

    testPostMessageWithObject: function() {
      //this._send({a:"1", b:2, c:3});
      this._send({a:"1", b:2, c:true}, function(mess, e) {
        this.assertIdentical(mess.a, e.getData().a);
        this.assertIdentical(mess.b, e.getData().b);
        this.assertIdentical(mess.c, e.getData().c);
      });
    },

    testPostMessageWithArray: function() {
      //this._send(["1", 2, true]);
      this._send(["1", 2, true], function(mess, e) {
        this.assertIdentical(mess[0], e.getData()[0]);
        this.assertIdentical(mess[1], e.getData()[1]);
        this.assertIdentical(mess[2], e.getData()[2]);
      });
    }
  }
});
