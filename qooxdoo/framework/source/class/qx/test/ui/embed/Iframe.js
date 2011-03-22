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

qx.Class.define("qx.test.ui.embed.Iframe",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function()
    {
      this.__iframe = new qx.ui.embed.Iframe;
      this.__iframe.set({ width: 200, height: 500 });
    },

    tearDown : function() {
      this.__iframe.dispose();
    },

    testGetWindow : function()
    {
      this.__iframe.setSource("http://www.qooxdoo.org");
      this.getRoot().add(this.__iframe);

      this.__iframe.addListener("load", function() {
        this.assertNotNull(this.getWindow());
      }, this);

      this.getRoot().remove(this.__iframe);
    }
  }
});

