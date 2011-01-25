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
qx.Class.define("qx.test.bom.client.Feature", 
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testDataImages : function() {
      if (qx.bom.client.Browser.NAME == "ie" && qx.bom.client.Browser.VERSION < 8) {
        this.assertFalse(qx.bom.client.Feature.DATA_URL);
      } else {
        this.assertTrue(qx.bom.client.Feature.DATA_URL);
      }
    }
  }
});
