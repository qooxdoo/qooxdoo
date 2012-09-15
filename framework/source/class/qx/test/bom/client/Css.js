/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

qx.Class.define("qx.test.bom.client.Css",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testBorderImageSyntax : function()
    {
      var styleName = qx.core.Environment.get("css.borderimage");
      if (typeof styleName!== "string") {
        throw new qx.dev.unit.RequirementError("css.borderimage");
      }

      var standardSyntax = qx.core.Environment.get("css.borderimage.standardsyntax");
      this.assertBoolean(standardSyntax, "Browser supports borderImage but " +
        "syntax type was not detected!");

      if (styleName == "borderImage") {
        this.assertTrue(standardSyntax, "Browser supports unprefixed borderImage " +
          "but syntax type detected as non-standard!");
      }
      else {
        this.assertFalse(standardSyntax, "Browser supports prefixed borderImage " +
          "but syntax type detected as standard!");
      }
    }
  }
});