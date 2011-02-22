/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

qx.Class.define("qx.test.util.Base64",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    testEncodeDecode : function()
    {
      var str = "Luke, I'm your father! Nooooooooooo!";
      var encodedStr = qx.util.Base64.encode(str);
      this.assertEquals(str, qx.util.Base64.decode(encodedStr));
    }

  }
});
