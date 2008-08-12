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

/**
 * Like the normal {@link Button} but instead of executing a command
 * it opens menu when clicked on.
 */
qx.Class.define("qx.ui.toolbar.MenuButton",
{
  extend : qx.ui.form.MenuButton,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon, menu)
  {
    this.base(arguments, label, icon, menu);

    this.removeListener("keydown", this._onKeyDown);
    this.removeListener("keyup", this._onKeyUp);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "toolbar-button"
    },

    show :
    {
      refine : true,
      init : "inherit"
    },

    focusable :
    {
      refine : true,
      init : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Inspects the parent chain to find a ToolBar instance.
     *
     * @return {qx.ui.toolbar.ToolBar} Toolbar instance or <code>null</code>.
     */
    getToolBar : function()
    {
      var parent = this;
      while (parent)
      {
        if (parent instanceof qx.ui.toolbar.ToolBar) {
          return parent;
        }

        parent = parent.getLayoutParent();
      }

      return null;
    },





    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Listener for visibility property changes of the attached menu
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onMenuChange : function(e)
    {
      var menu = this.getMenu();
      var toolbar = this.getToolBar();

      if (menu.isVisible())
      {
        this.addState("pressed");

        // Sync with open menu property
        if (toolbar) {
          toolbar.setOpenMenu(menu);
        }
      }
      else
      {
        this.removeState("pressed");

        // Sync with open menu property
        if (toolbar && toolbar.getOpenMenu() == menu) {
          toolbar.resetOpenMenu();
        }
      }
    },


    /**
     * Event listener for mouseover event
     *
     * @param e {qx.event.type.Mouse} mouseover event object
     */
    _onMouseOver : function(e)
    {
      // Add hovered state
      this.addState("hovered");

      // Open submenu
      if (this.getMenu())
      {
        var toolbar = this.getToolBar();
        var open = toolbar.getOpenMenu();

        if (open && open != this.getMenu())
        {
          // Hide all open menus
          qx.ui.menu.Manager.getInstance().hideAll();

          // Then show the attached menu
          this.open();
        }
      }
    }
  }
});
