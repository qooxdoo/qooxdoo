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
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __arr : null,

    setUp : function()
    {
      this.__arr = new qx.type.Array();
    },

    testAppend : function() {
      // native array
      this.__arr.append([1, 2]);
      this.assertEquals(this.__arr[0], 1);
      this.assertEquals(this.__arr[1], 2);

      // type array
      var a = new qx.type.Array();
      a.push(3);
      a.push(4);

      this.__arr.append(a);
      this.assertJsonEquals(this.__arr[2], 3);
      this.assertJsonEquals(this.__arr[3], 4);
    }
  }
});
