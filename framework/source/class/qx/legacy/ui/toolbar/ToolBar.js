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
 * @appearance toolbar
 */
qx.Class.define("qx.legacy.ui.toolbar.ToolBar",
{
  extend : qx.legacy.ui.layout.HorizontalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.addListener("keypress", this._onKeyPress);

    // Initialize properties
    this.initHeight();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Appearance of the widget */
    appearance :
    {
      refine : true,
      init : "toolbar"
    },

    height :
    {
      refine : true,
      init : "auto"
    },


    openMenu :
    {
      check : "qx.legacy.ui.menu.Menu",
      event : "changeOpenMenu",
      nullable : true
    },

    show :
    {
      init : "both",
      check : [ "both", "label", "icon", "none"],
      nullable : true,
      inheritable : true,
      event : "changeShow"
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
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getAllButtons : function()
    {
      var vChildren = this.getChildren();
      var vLength = vChildren.length;
      var vDeepChildren = [];
      var vCurrent;

      for (var i=0; i<vLength; i++)
      {
        vCurrent = vChildren[i];

        if (vCurrent instanceof qx.legacy.ui.toolbar.MenuButton) {
          vDeepChildren.push(vCurrent);
        } else if (vCurrent instanceof qx.legacy.ui.toolbar.Part) {
          vDeepChildren = vDeepChildren.concat(vCurrent.getChildren());
        }
      }

      return vDeepChildren;
    },




    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Wraps key events to target functions
     *
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    _onKeyPress : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Left":
          return this._onKeyPress_left();

        case "Right":
          return this._onKeyPress_right();
      }
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _onKeyPress_left : function()
    {
      var vMenu = this.getOpenMenu();

      if (!vMenu) {
        return;
      }

      var vOpener = vMenu.getOpener();

      if (!vOpener) {
        return;
      }

      var vChildren = this.getAllButtons();
      var vChildrenLength = vChildren.length;
      var vIndex = vChildren.indexOf(vOpener);
      var vCurrent;
      var vPrevButton = null;

      for (var i=vIndex-1; i>=0; i--)
      {
        vCurrent = vChildren[i];

        if (vCurrent instanceof qx.legacy.ui.toolbar.MenuButton && vCurrent.getEnabled())
        {
          vPrevButton = vCurrent;
          break;
        }
      }

      // If none found, try again from the begin (looping)
      if (!vPrevButton)
      {
        for (var i=vChildrenLength-1; i>vIndex; i--)
        {
          vCurrent = vChildren[i];

          if (vCurrent instanceof qx.legacy.ui.toolbar.MenuButton && vCurrent.getEnabled())
          {
            vPrevButton = vCurrent;
            break;
          }
        }
      }

      if (vPrevButton)
      {
        // hide other menus
        qx.legacy.ui.menu.Manager.getInstance().update();

        // show previous menu
        vPrevButton._showMenu(true);
      }
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _onKeyPress_right : function()
    {
      var vMenu = this.getOpenMenu();

      if (!vMenu) {
        return;
      }

      var vOpener = vMenu.getOpener();

      if (!vOpener) {
        return;
      }

      var vChildren = this.getAllButtons();
      var vChildrenLength = vChildren.length;
      var vIndex = vChildren.indexOf(vOpener);
      var vCurrent;
      var vNextButton = null;

      for (var i=vIndex+1; i<vChildrenLength; i++)
      {
        vCurrent = vChildren[i];

        if (vCurrent instanceof qx.legacy.ui.toolbar.MenuButton && vCurrent.getEnabled())
        {
          vNextButton = vCurrent;
          break;
        }
      }

      // If none found, try again from the begin (looping)
      if (!vNextButton)
      {
        for (var i=0; i<vIndex; i++)
        {
          vCurrent = vChildren[i];

          if (vCurrent instanceof qx.legacy.ui.toolbar.MenuButton && vCurrent.getEnabled())
          {
            vNextButton = vCurrent;
            break;
          }
        }
      }

      if (vNextButton)
      {
        // hide other menus
        qx.legacy.ui.menu.Manager.getInstance().update();

        // show next menu
        vNextButton._showMenu(true);
      }
    }
  }
});
