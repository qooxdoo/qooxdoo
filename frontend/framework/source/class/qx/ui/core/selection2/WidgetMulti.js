/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

qx.Class.define("qx.ui.core.selection2.WidgetMulti",
{
  extend : qx.ui.core.selection2.AbstractMulti,


  construct : function(widget)
  {
    this.base(arguments);

    this._widget = widget;
  },

  members :
  {
    // overridden
    _itemToHashCode : function(item) {
      return item.$$hash;
    }







  },

  destruct : function()
  {
    this.disposeFields("_widget");
  }
});
