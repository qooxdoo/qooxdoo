/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.type.Array",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __arr : null,

    setUp : function()
    {
      this.__arr = new qx.type.Array("x");
    },

    testConstruct : function() {
      this.assertEquals(this.__arr[0], "x");
    },

    testAppend : function() {
      // native array
      this.__arr.append([1, 2]);
      this.assertEquals(this.__arr[1], 1);
      this.assertEquals(this.__arr[2], 2);

      // type array
      var a = new qx.type.Array(3, 4);
      this.__arr.append(a);
      this.assertEquals(this.__arr[3], 3);
      this.assertEquals(this.__arr[4], 4);

      // type base array
      var b = new qx.type.BaseArray(5, 6);
      this.__arr.append(b);
      this.assertEquals(this.__arr[5], 5);
      this.assertEquals(this.__arr[6], 6);
    },


    testPrepend : function() {
      // native array
      this.__arr.prepend([1, 2]);
      this.assertEquals(this.__arr[0], 1);
      this.assertEquals(this.__arr[1], 2);

      // type array
      var a = new qx.type.Array(3, 4);
      this.__arr.prepend(a);
      this.assertEquals(this.__arr[0], 3);
      this.assertEquals(this.__arr[1], 4);

      // type base array
      var b = new qx.type.BaseArray(5, 6);
      this.__arr.prepend(b);
      this.assertEquals(this.__arr[0], 5);
      this.assertEquals(this.__arr[1], 6);
    }
  }
});
