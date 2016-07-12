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
 *
 * @asset(qx/test/primitive.json)
 */

qx.Class.define("qx.test.data.store.RestWithRemote",
{
  extend: qx.dev.unit.TestCase,

  include : [qx.dev.unit.MRequirements,
             qx.test.io.MRemoteTest],

  members:
  {
    setUp: function() {
      var url = this.getUrl("qx/test/primitive.json"),
          res = this.res = new qx.io.rest.Resource({index: {method: "GET", url: url} }),
          store = this.store = new qx.data.store.Rest(res, "index");

      res.configureRequest(function(req) {
        req.setParser(qx.util.ResponseParser.PARSER.json);
      });

      this.require(["http"]);
    },

    tearDown: function() {
      this.res.dispose();
      this.store.dispose();
    },

    "test: populate store with response of resource action": function() {
      var res = this.res,
          store = this.store;

      res.addListener("success", function() {
        this.resume(function() {
          this.assertEquals("String", store.getModel().getString());
        }, this);
      }, this);

      res.index();
      this.wait();
    },

    "test: bind model property": function() {
      var res = this.res,
          store = this.store,
          label = new qx.ui.basic.Label();

      res.addListener("success", function() {
        this.resume(function() {
          this.assertEquals("String", label.getValue());
        }, this);
      }, this);

      res.index();
      store.bind("model.string", label, "value");

      this.wait();
    },

    skip: function(msg) {
      throw new qx.dev.unit.RequirementError(null, msg);
    }

  }
});
