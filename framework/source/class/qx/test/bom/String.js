/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.test.bom.String",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    testToText_Break : function()
    {
      this.assertEquals(qx.bom.String.toText("<br>"), "\n");
      this.assertEquals(qx.bom.String.toText("<br />"), "\n");
    },

    testToText_Advanced : function()
    {
      this.assertEquals(qx.bom.String.toText("<div style='padding:5px;'>"), "");
      this.assertEquals(qx.bom.String.toText("<div style='padding:5px;'>foo</div></div>"), "foo");

      this.assertEquals(qx.bom.String.toText("<div style='padding:5px;'> "), " ");
      this.assertEquals(qx.bom.String.toText("<div style='padding:5px;'> foo </div></div>"), " foo ");
    }

  }
});
