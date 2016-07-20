/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.layout.LayoutRoot",
{
  extend : qx.test.ui.layout.LayoutItem,

  construct : function()
  {
    this.base(arguments, 10000, 10000);
    this.setLayout(new qx.ui.layout.Basic());
    qx.ui.core.queue.Visibility.add(this);
  },

  members :
  {
    isRootWidget : function() {
      return true;
    }
  },

  destruct : function()
  {
    this._getLayout().dispose();
  }
});
