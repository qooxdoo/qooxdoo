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

qx.Class.define("qx.test.io.request.XhrEvents",
{
  extend: qx.dev.unit.TestCase,

  include: qx.dev.unit.MMock,

  members:
  {
    setUp : function() {
      this.useFakeServer();

      this.req = new qx.io.request.Xhr();
      this.server = this.getServer();
    },

    tearDown : function() {
      this.getSandbox().restore();
    },

    "test: should fire multiple readystatechange": function() {
      var req = this.req,
          server = this.server,
          spy = this.spy();

      req.setUrl("found");
      req.setMethod("GET");
      server.respondWith("GET", "found", [200, {}, "FOUND"]);

      req.addListener("readystatechange", spy);
      req.send();
      server.respond();

      this.assertCallCount(spy, 4);
    }

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
    // }
  }
});
