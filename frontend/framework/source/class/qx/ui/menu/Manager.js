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

/** This singleton manages multiple instances of qx.legacy.ui.menu.Menu and their state. */
qx.Class.define("qx.ui.menu.Manager",
{
  type : "singleton",
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Create data structure
    this.__objects = [];

    // React on mousedown/mouseup events
    var root = qx.core.Init.getApplication().getRoot();
    root.addListener("mousedown", this._onMouseDown, this, true);
    root.addListener("mouseup", this._onMouseUp, this);

    // React on keypress events
    root.addListener("keypress", this._onKeyPress, this, true);

    // Hide all when the window is blurred
    qx.bom.Element.addListener(window, "blur", this.hideAll, this);
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
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    add : function(obj)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!(obj instanceof qx.ui.menu.Menu)) {
          throw new Error("Object is no menu: " + obj);
        }
      }

      var reg = this.__objects;
      reg.push(obj);
      obj.setZIndex(1e6+reg.length);
    },


    remove : function(obj)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!(obj instanceof qx.ui.menu.Menu)) {
          throw new Error("Object is no menu: " + obj);
        }
      }

      var ret = qx.lang.Array.remove(this.__objects, obj);
    },


    hideAll : function()
    {
      var reg = this.__objects;
      for (var i=reg.length-1; i>=0; i--) {
        reg[i].exclude();
      }
    },


    isInMenu : function(widget)
    {
      while(widget)
      {
        if (widget instanceof qx.ui.menu.Menu) {
          return true;
        }

        widget = widget.getLayoutParent();
      }

      return false;
    },


    getActiveMenu : function()
    {
      var reg = this.__objects;
      return reg.length > 0 ? reg[reg.length-1] : null;
    },



    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    _onMouseDown : function(e)
    {
      var target = e.getTarget();

      // All clicks not inside a menu will hide
      // all currently open menus
      if (!this.isInMenu(target)) {
        this.hideAll();
      }
    },

    _onMouseUp : function(e)
    {
      var target = e.getTarget();

      // All mouseups not exactly clicking on the menu
      // hide all currently open menus
      // Separators for example are anonymous. This way the
      // target is the menu. It is wanted that clicks on
      // Separators are ignored completely
      if (!(target instanceof qx.ui.menu.Menu)) {
        this.hideAll();
      }
    },

    /*
    ---------------------------------------------------------------------------
      KEY EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for all key events. Delegates the event to the more
     * specific methods defined in this class.
     *
     * Currently processes the keys: <code>Up</code>, <code>Down</code>,
     * <code>Left</code>, <code>Right</code> and <code>Enter</code>.
     *
     * @param e {qx.event.type.KeySequence} Keyboard event
     * @return {void}
     */
    _onKeyPress : function(e)
    {
      var menu = this.getActiveMenu();
      if (!menu) {
        return;
      }

      switch(e.getKeyIdentifier())
      {
        case "Up":
          this._onKeyPressUp(menu);
          break;

        case "Down":
          this._onKeyPressDown(menu);
          break;

        case "Left":
          this._onKeyPressLeft(menu);
          break;

        case "Right":
          this._onKeyPressRight(menu);
          break;

        case "Enter":
          this._onKeyPressEnter(menu);
          break;

        default:
          return;
      }

      // Stop all processed events
      e.preventDefault();
    },


    /**
     * Event handler for <code>Up</code> key
     *
     * @return {void}
     */
    _onKeyPressUp : function(menu)
    {
      var children = menu.getChildren();

      var hoverItem = menu.getHoverItem();
      var nextItem;

      if (hoverItem)
      {
        var index = children.indexOf(hoverItem)-1;
        for (var i=index; i>=0; i--)
        {
          if (children[i].isEnabled() && !children[i].isAnonymous())
          {
            nextItem = children[i];
            break;
          }
        }
      }

      // No next item found, start with first one
      if (!nextItem)
      {
        for (var i=children.length-1; i>=0; i--)
        {
          if (children[i].isEnabled() && !children[i].isAnonymous())
          {
            nextItem = children[i];
            break;
          }
        }
      }

      // Reconfigure property
      if (nextItem) {
        menu.setHoverItem(nextItem);
      } else {
        menu.resetHoverItem();
      }
    },


    /**
     * Event handler for <code>Down</code> key
     *
     * @return {void}
     */
    _onKeyPressDown : function(menu)
    {
      var children = menu.getChildren();

      var hoverItem = menu.getHoverItem();
      var nextItem;

      if (hoverItem)
      {
        var index = children.indexOf(hoverItem)+1;
        for (var i=index, l=children.length; i<l; i++)
        {
          if (children[i].isEnabled() && !children[i].isAnonymous())
          {
            nextItem = children[i];
            break;
          }
        }
      }

      // No next item found, start with first one
      if (!nextItem)
      {
        for (var i=0, l=children.length; i<l; i++)
        {
          if (children[i].isEnabled() && !children[i].isAnonymous())
          {
            nextItem = children[i];
            break;
          }
        }
      }

      // Reconfigure property
      if (nextItem) {
        menu.setHoverItem(nextItem);
      } else {
        menu.resetHoverItem();
      }
    },


    /**
     * Event handler for <code>Left</code> key
     *
     * @return {void}
     */
    _onKeyPressLeft : function()
    {
      var menuOpener = this.getOpener();

      // Jump to the "parent" qx.ui.menu.Menu
      if (menuOpener instanceof qx.ui.menu.Button)
      {
        var openerParentMenu = this.getOpener().getLayoutParent();

        openerParentMenu.resetOpenItem();
        openerParentMenu.setHoverItem(menuOpener);

        openerParentMenu._makeActive();
      }

      // Jump to the previous ToolBarMenuButton
      else if (menuOpener instanceof qx.ui.toolbar.MenuButton)
      {
        var toolbar = menuOpener.getParentToolBar();

        // change active widget to new button
        this.getFocusRoot().setActiveChild(toolbar);

        // execute toolbars keydown implementation
        toolbar._onKeyPress(e);
      }
    },


    /**
     * Event handler for <code>Right</code> key
     *
     * @return {void}
     */
    _onKeyPressRight : function(menu)
    {
      var hoverItem = menu.getHoverItem();

      if (hoverItem)
      {
        var subMenu = hoverItem.getMenu();

        if (subMenu)
        {
          menu.setOpenItem(hoverItem);

          // mark first item in new submenu
          subMenu.setHoverItem(menu.getFirstActiveChild());

          return;
        }
      }
      else if (!this.getOpenItem())
      {
        var first = this.getLayout().getFirstActiveChild();

        if (first) {
          first.getMenu() ? this.setOpenItem(first) : this.setHoverItem(first);
        }
      }

      // Jump to the next ToolBarMenuButton
      var menuOpener = this.getOpener();

      if (menuOpener instanceof qx.ui.toolbar.MenuButton)
      {
        var toolbar = menuOpener.getParentToolBar();

        // change active widget to new button
        this.getFocusRoot().setActiveChild(toolbar);

        // execute toolbars keydown implementation
        toolbar._onKeyPress(e);
      }
      else if (menuOpener instanceof qx.ui.menu.Button && hoverItem)
      {
        // search for menubar if existing
        // menu -> button -> menu -> button -> menu -> menubarbutton -> menubar
        var openerParentMenu = menuOpener.getLayoutParent();

        while (openerParentMenu && openerParentMenu instanceof qx.ui.menu.Menu)
        {
          menuOpener = openerParentMenu.getOpener();

          if (menuOpener instanceof qx.ui.menu.Button) {
            openerParentMenu = menuOpener.getLayoutParent();
          }
          else
          {
            if (menuOpener) {
              openerParentMenu = menuOpener.getLayoutParent();
            }

            break;
          }
        }

        if (openerParentMenu instanceof qx.ui.toolbar.Part) {
          openerParentMenu = openerParentMenu.getLayoutParent();
        }

        if (openerParentMenu instanceof qx.ui.toolbar.ToolBar)
        {
          // jump to next menubarbutton
          this.getFocusRoot().setActiveChild(openerParentMenu);
          openerParentMenu._onKeyPress(e);
        }
      }
    },


    /**
     * Event handler for <code>Enter</code> key
     *
     * @return {void}
     */
    _onKeyPressEnter : function()
    {
      var hoverItem = this.getHoverItem();

      if (hoverItem) {
        hoverItem.execute();
      }

      qx.ui.menu.Manager.getInstance().update();
    }
  }
});
