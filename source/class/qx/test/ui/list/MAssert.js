/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Mixin.define("qx.test.ui.list.MAssert",
{
  members :
  {
    assertModelEqualsRowData : function(model, list)
    {
      for (var i = 0; i < model.getLength(); i++) {
        this.assertIdentical(model.getItem(i), list._getDataFromRow(i));
      }
    },

    assertDataArrayEquals : function(expected, value) {
      this.assertIdentical(expected.getLength(), value.getLength(), "The length of both arrays are not equal!");
      for (var i = 0; i < expected.getLength(); i++) {
        this.assertTrue(value.contains(expected.getItem(i)), "The array doesn't contain item '" + expected.getItem(i) + "'");
      }
    }
  }
});
