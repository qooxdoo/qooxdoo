/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.bom.Collection",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function() {},

    testFindNonExistingElementById : function()
    {
      // Id 'foo' is not existent in the document
      var result = qx.bom.Collection.id("foo").find("div");

      this.assertArrayEquals([], result, "ID selector on a non-existing ID does returns the whole document!");
    }
  }
});