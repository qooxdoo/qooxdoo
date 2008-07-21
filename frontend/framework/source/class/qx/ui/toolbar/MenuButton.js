/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

qx.Class.define("qx.ui.toolbar.MenuButton",
{
  extend : qx.ui.toolbar.Button,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon, menu)
  {
    this.base(arguments, label, icon);

    if (menu != null) {
      this.setMenu(menu);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    menu :
    {
      check : "qx.ui.menu.Menu",
      nullable : true,
      apply : "_applyMenu",
      event : "changeMenu"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property apply
    _applyMenu : function(value, old)
    {
      if (old) {
        old.removeListener("changeVisibility", this._onMenuChange, this);
      }

      if (value) {
        value.addListener("changeVisibility", this._onMenuChange, this);
      }
    },


    /**
     * Listener for visibility property changes of the attached menu
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onMenuChange : function(e)
    {
      if (this.getMenu().isVisible()) {
        this.addState("pressed");
      } else {
        this.removeState("pressed");
      }
    },



    _showMenu : function()
    {
      var menu = this.getMenu();

      if (menu)
      {
        var pos = this.getContainerLocation();
        menu.moveTo(pos.left, pos.bottom);
        menu.show();
      }
    },


    _onMouseDown : function(e)
    {
      var menu = this.getMenu();
      if (menu)
      {
        if (!menu.isVisible())
        {
          this._showMenu();
        }
        else
        {
          menu.exclude();
        }
      }

      e.stopPropagation();
    },

    _onMouseUp : function(e)
    {
      var menu = this.getMenu();
      if (menu)
      {
      }

      e.stopPropagation();
    },

    _onMouseOver : function(e)
    {
      this.addState("hovered");

      if (this.getMenu())
      {
        var mgr = qx.ui.menu.Manager.getInstance();
        var activeMenu = mgr.getActiveMenu();
        if (activeMenu)
        {
          mgr.hideAll();
          this._showMenu();
        }
      }
    },

    _onMouseOut : function(e)
    {
      this.removeState("hovered");
    }
  }
});
