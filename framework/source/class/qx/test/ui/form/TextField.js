/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Henner Kollmann

************************************************************************ */

qx.Class.define("qx.test.ui.form.TextField",
{
  extend: qx.test.ui.LayoutTestCase,

  members:
  {
    setUp: function() {
      this.__field = new qx.ui.form.TextField();
      this.getRoot().add(this.__field);
    },

    tearDown: function() {
      this.__field.destroy();
	  this.__field = null;
      this.base(arguments);
    },

    "test: get default length": function() {
      var l = this.__field.getMaxLength();
      this.assertEquals(Infinity, l);
    },

    "test: set max length": function() {
      this.__field.setMaxLength(4);
      var l = this.__field.getMaxLength();
      this.assertEquals(4, l);
    },
	
    "test: reset max length": function() {
      this.__field.setMaxLength(4);
      var l = this.__field.getMaxLength();
      this.assertEquals(4, l);
      this.__field.resetMaxLength();
      var l = this.__field.getMaxLength();
      this.assertEquals(Infinity, l);
    },
	

    __field: null
  }
});
