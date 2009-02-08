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
qx.Class.define("qx.ui.table.columnmenu.grid.MenuItem",
{
  extend     : qx.ui.form.ListItem,
  implement  : qx.ui.table.IColumnMenuItem,

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

  construct : function(menu, text, colNum)
  {
    this.base(arguments, text, null, colNum);
    this.__menu = menu;
  },

  members :
  {
    __menu : null,

    _applyVisible :  function(value, old)
    {
      if (value)
      {
        this.__menu.getHideList().addToSelection(this);
        if (this.__menu.getHideList().getSelection().length > 0)
        {
          this.__menu._setVisibility(false,
                                     this.__menu.getHideList(),
                                     this.__menu.getShowList(),
                                     true);
        }
      }
      else
      {
        this.__menu.getShowList().addToSelection(this);
        if (this.__menu.getShowList().getSelection().length > 0)
        {
          this.__menu._setVisibility(true,
                                     this.__menu.getShowList(),
                                     this.__menu.getHideList(),
                                     true);
        }
      }
    }
  }
});
