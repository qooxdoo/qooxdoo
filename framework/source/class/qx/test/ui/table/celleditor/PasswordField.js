/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.table.celleditor.PasswordField", {
  extend : qx.test.ui.table.celleditor.AbstractField,

  members :
  {
    setUp : function() {
      this.factory = new qx.ui.table.celleditor.PasswordField();
    },


    tearDown : function()
    {
      this.base(arguments);
      this.factory.dispose();
    }
  }
});
