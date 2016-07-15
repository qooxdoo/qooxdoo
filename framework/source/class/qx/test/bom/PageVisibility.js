/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */


qx.Class.define("qx.test.bom.PageVisibility",
{
  extend : qx.dev.unit.TestCase,
  include : [qx.dev.unit.MMock],

  members :
  {
    setUp : function() {
      this.__visibility = new qx.bom.PageVisibility();
    },


    testVisibilityState : function() {
      var possible = ["hidden", "visible", "prerender", "unloaded"];
      var value = this.__visibility.getVisibilityState();
      this.assertInArray(value, possible);
    },


    testHidden : function() {
      this.assertBoolean(this.__visibility.isHidden());
    },


    testGetInstance : function() {
      this.assertEquals(qx.bom.PageVisibility.getInstance(), qx.bom.PageVisibility.getInstance());
    }
  }
});