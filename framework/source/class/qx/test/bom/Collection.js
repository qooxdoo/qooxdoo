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

/* ************************************************************************

#ignore($)

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
    },

    "test find element by using the Id with the $ shortcut" : function()
    {
      var element = document.createElement("div");
      element.id = "foo";
      document.body.appendChild(element);

      var result = $("#foo");

      this.assertEquals(result.length, 1, "No element found!");

      document.body.removeChild(element);
    }
  }
});