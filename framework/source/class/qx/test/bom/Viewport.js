/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

qx.Class.define("qx.test.bom.Viewport", {
  extend : qx.dev.unit.TestCase,

  members :
  {
    testGetScrollLeft : function()
    {
      this.assertPositiveInteger(qx.bom.Viewport.getScrollLeft());
    },

    testGetScrollTop : function()
    {
      this.assertPositiveInteger(qx.bom.Viewport.getScrollTop());
    }
  }
});