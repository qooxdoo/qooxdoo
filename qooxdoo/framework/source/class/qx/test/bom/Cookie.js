/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.bom.Cookie",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    testSaveSimpleData : function()
    {
      var key = "qx.test.bom.Cookie.testSaveSimpleData";
      var dataToSave = "Qooxdoo";

      // Check that no value exists
      var result = qx.bom.Cookie.get(key);
      this.assertNull(result, "Empty check before start");

      // Set and restore value
      qx.bom.Cookie.set(key, dataToSave);
      result = qx.bom.Cookie.get(key);
      this.assertEquals(dataToSave, result, "It is expected that this test fails" +
          " if you start this test from a file system with Google Chrome.");

      // remove value
      qx.bom.Cookie.del(key);
      result = qx.bom.Cookie.get(key);
      this.assertNull(result, "Remove value");
    },

    testSaveData : function()
    {
      var key1 = "qx.test.bom.Cookie.testSaveData2";
      var key2 = "qx.test.bom.Cookie.testSaveData1";
      var dataToSave1 = "Qooxdoo 1";
      var dataToSave2 = "Qooxdoo 2";

      // Check that no values exist
      var result1 = qx.bom.Cookie.get(key1);
      var result2 = qx.bom.Cookie.get(key2);
      this.assertNull(result1, "Empty check before start (one)");
      this.assertNull(result2, "Empty check before start (tow)");

      // Set and restore values
      qx.bom.Cookie.set(key1, dataToSave1);
      qx.bom.Cookie.set(key2, dataToSave2);
      result1 = qx.bom.Cookie.get(key1);
      result2 = qx.bom.Cookie.get(key2);
      this.assertEquals(dataToSave1, result1, "It is expected that this test fails" +
          " if you start this test from a file system with Google Chrome.");
      this.assertEquals(dataToSave2, result2, "It is expected that this test fails" +
          " if you start this test from a file system with Google Chrome.");

      // remove values
      qx.bom.Cookie.del(key1);
      qx.bom.Cookie.del(key2);
      result1 = qx.bom.Cookie.get(key1);
      result2 = qx.bom.Cookie.get(key2);
      this.assertNull(result1, "Remove value (one)");
      this.assertNull(result2, "Remove value (tow)");
    }
  }
});
