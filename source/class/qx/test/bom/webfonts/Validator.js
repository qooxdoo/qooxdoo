/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("qx.test.bom.webfonts.Validator", {
  extend: qx.test.bom.webfonts.Abstract,

  include: [qx.dev.unit.MRequirements],

  members: {
    setUp() {
      this.require(["webFontSupport"]);
      this.__val = new qx.bom.webfonts.Validator();
    },

    tearDown() {
      if (this.__val) {
        this.__val.dispose();
        delete this.__val;
      }
      qx.bom.webfonts.Validator.removeDefaultHelperElements();
    },

    testValidFont() {
      this.__val.setFontFamily("monospace, courier");
      this.__val.addListener("changeStatus", ev => {
        var result = ev.getData();
        this.resume(function (ev) {
          this.assertTrue(result.valid);
        }, this);
      });

      var that = this;
      window.setTimeout(function () {
        that.__val.validate();
      }, 0);
      this.wait(1000);
    },

    testInvalidFont() {
      this.__val.setFontFamily("zzzzzzzzzzzzzzz");
      this.__val.setTimeout(250);
      this.__val.addListener("changeStatus", ev => {
        var result = ev.getData();
        this.resume(function (ev) {
          this.assertFalse(result.valid);
        }, this);
      });

      var that = this;
      window.setTimeout(function () {
        that.__val.validate();
      }, 0);
      this.wait(500);
    }
  }
});
