/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * A menu item.
 */
qx.Class.define("qx.ui.table.columnmenu.simple.MenuItem",
{
  extend     : qx.ui.menu.CheckBox,

  properties :
  {
    visible :
    {
      check : "Boolean",
      init  : true,
      apply : "_applyVisible",
      event : "changeVisible"
    }
  },

  construct : function(text)
  {
    this.base(arguments, text);

    // Mirror native "checked" property in our "visible" property
    this.addListener("changeChecked",
                     function(e)
                     {
                       this.bInListener = true;
                       this.setVisible(e.getData());
                       this.bInListener = false;
                     });
  },

  members :
  {
    __bInListener : false,

    _applyVisible : function(value, oldValue)
    {
      // avoid recursion if called from listener on "changeChecked" property
      if (! this.bInListener)
      {
        this.setChecked(value);
      }
    }
  }
});
