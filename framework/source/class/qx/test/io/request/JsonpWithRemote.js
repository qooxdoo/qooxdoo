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

#asset(qx/test/jsonp_primitive.php)

************************************************************************ */

qx.Class.define("qx.test.io.request.JsonpWithRemote",
{
  extend : qx.dev.unit.TestCase,

  include: [qx.test.io.MRemoteTest,
            qx.dev.unit.MRequirements],

  members :
  {
    setUp: function() {
      this.require(["http"]);
    },

    tearDown: function() {
      this.req.dispose();
    },

    "test: fetch json": function() {
      var req = this.req = new qx.io.request.Jsonp(),
          url = this.noCache(this.getUrl("qx/test/jsonp_primitive.php"));

      req.addListener("load", function(e) {
        this.resume(function() {
          this.assertObject(req.getResponse());
          this.assertTrue(req.getResponse()["boolean"]);
        }, this);
      }, this);

      req.setUrl(url);
      req.send();

      this.wait();
    },

    noCache: function(url) {
      return qx.util.Uri.appendParamsToUrl(url, "nocache=" + (new Date).valueOf());
    }

  }
});
