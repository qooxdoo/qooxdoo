/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

qx.Class.define("qx.test.mobile.form.Group",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testGroup : function()
    {
      var button = new qx.ui.mobile.form.Button("affe");
      var group = new qx.ui.mobile.form.Group();
      group.add(button);
      this.getRoot().add(button);

      group.destroy();
      button.destroy();
    }
  }

});
