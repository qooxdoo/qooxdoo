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

qx.Class.define("qx.legacy.ui.toolbar.MenuButton",
{
  extend : qx.legacy.ui.toolbar.Button,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vMenu, vIcon, vIconWidth, vIconHeight, vFlash)
  {
    this.base(arguments, vText, vIcon, vIconWidth, vIconHeight, vFlash);

    if (vMenu != null) {
      this.setMenu(vMenu);
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
      check : "qx.legacy.ui.menu.Menu",
      nullable : true,
      apply : "_applyMenu",
      event : "changeMenu"
    },

    direction :
    {
      check : [ "up", "down" ],
      init : "down",
      event : "changeDirection"
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
    getParentToolBar : function()
    {
      var vParent = this.getParent();

      if (vParent instanceof qx.legacy.ui.toolbar.Part) {
        vParent = vParent.getParent();
      }

      return vParent instanceof qx.legacy.ui.toolbar.ToolBar ? vParent : null;
    },


    /**
     * TODOC
     *
     * @param vFromKeyEvent {var} TODOC
     * @return {void}
     */
    _showMenu : function(vFromKeyEvent)
    {
      var vMenu = this.getMenu();

      if (vMenu)
      {
        // Caching common stuff
        var vButtonElement = this.getElement();
        var buttonPos = qx.bom.element.Location.get(vButtonElement);

        // Apply X-Location
        vMenu.setLeft(buttonPos.left);

        // Apply Y-Location
        switch(this.getDirection())
        {
          case "up":
            vMenu.setBottom(buttonPos.top);
            vMenu.setTop(null);
            break;

          case "down":
            vMenu.setTop(buttonPos.bottom);
            vMenu.setBottom(null);
            break;
        }

        this.addState("pressed");

        // If this show is called from a key event occured, we want to highlight
        // the first menubutton inside.
        if (vFromKeyEvent) {
          vMenu.setHoverItem(vMenu.getFirstActiveChild());
        }

        vMenu.show();
      }
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _hideMenu : function()
    {
      var vMenu = this.getMenu();

      if (vMenu) {
        vMenu.hide();
      }
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyMenu : function(value, old)
    {
      if (old)
      {
        old.setOpener(null);

        old.removeListener("appear", this._onmenuappear, this);
        old.removeListener("disappear", this._onmenudisappear, this);
      }

      if (value)
      {
        value.setOpener(this);

        value.addListener("appear", this._onmenuappear, this);
        value.addListener("disappear", this._onmenudisappear, this);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENTS: MOUSE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e)
    {
      if (e.getTarget() != this || !e.isLeftButtonPressed()) {
        return;
      }

      this.hasState("pressed") ? this._hideMenu() : this._showMenu();
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e) {},


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseout : function(e)
    {
      if (e.getTarget() != this) {
        return;
      }

      this.removeState("over");
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void} TODOC
     */
    _onmouseover : function(e)
    {
      var vToolBar = this.getParentToolBar();

      if (vToolBar)
      {
        var vMenu = this.getMenu();

        switch(vToolBar.getOpenMenu())
        {
          case null:
          case vMenu:
            break;

          default:
            // hide other menus
            qx.legacy.ui.menu.Manager.getInstance().update();

            // show this menu
            this._showMenu();
        }
      }

      return this.base(arguments, e);
    },




    /*
    ---------------------------------------------------------------------------
      EVENTS: MENU
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmenuappear : function(e)
    {
      var vToolBar = this.getParentToolBar();

      if (!vToolBar) {
        return;
      }

      var vMenu = this.getMenu();

      vToolBar.setOpenMenu(vMenu);
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmenudisappear : function(e)
    {
      var vToolBar = this.getParentToolBar();

      if (!vToolBar) {
        return;
      }

      var vMenu = this.getMenu();

      if (vToolBar.getOpenMenu() == vMenu) {
        vToolBar.setOpenMenu(null);
      }
    }
  }
});
