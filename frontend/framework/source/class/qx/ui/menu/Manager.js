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

    // Create open timer
    this._openTimer = new qx.event.Timer;
    this._openTimer.addListener("interval", this._onOpenInterval, this);

    // Create close timer
    this._closeTimer = new qx.event.Timer;
    this._closeTimer.addListener("interval", this._onCloseInterval, this);
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
     * Query engine for menu children.
     *
     * @param menu {qx.ui.menu.Menu} Any menu instance
     * @param start {Integer} Child index to start with
     * @param iter {Integer} Iteration count, normally <code>+1</code> or <code>-1</code>
     * @param loop {Boolean?false} Whether to wrap when reaching the begin/end of the list
     * @return {qx.ui.menu.Button} Any menu button or <code>null</code>
     */
    _getChild : function(menu, start, iter, loop)
    {
      var children = menu.getChildren();
      var length = children.length;
      var child;

      for (var i=start; i<length && i>=0; i+=iter)
      {
        child = children[i];
        if (child.isEnabled() && !child.isAnonymous()) {
          return child;
        }
      }

      if (loop)
      {
        i = i == length ? 0 : length-1;
        for (; i!=start; i+=iter)
        {
          child = children[i];
          if (child.isEnabled() && !child.isAnonymous()) {
            return child;
          }
        }
      }

      return null;
    },


    /**
     * Whether the given widget is inside any Menu instance.
     *
     * @return {Boolean} <code>true</code> when the widget is part of any menu
     */
    _isInMenu : function(widget)
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




    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a menu to the list of visible menus.
     *
     * @param obj {qx.ui.menu.Menu} Any menu instance.
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


    /**
     * Remove a menu from the list of visible menus.
     *
     * @param obj {qx.ui.menu.Menu} Any menu instance.
     */
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


    /**
     * Hides all currently opened menus.
     */
    hideAll : function()
    {
      var reg = this.__objects;
      for (var i=reg.length-1; i>=0; i--) {
        reg[i].exclude();
      }
    },


    /**
     * Returns the menu which was opened at last (which
     * is the active one this way)
     *
     * @return {qx.ui.menu.Menu} The current active menu or <code>null</code>
     */
    getActiveMenu : function()
    {
      var reg = this.__objects;
      return reg.length > 0 ? reg[reg.length-1] : null;
    },




    /*
    ---------------------------------------------------------------------------
      SCHEDULED OPEN/CLOSE SUPPORT
    ---------------------------------------------------------------------------
    */

    scheduleOpen : function(menu)
    {
      // Cancel close of given menu first
      this.cancelClose(menu);

      // When the menu is already visible
      if (menu.isVisible())
      {
        // Cancel all other open requests
        if (this._scheduleOpen) {
          this.cancelOpen(this._scheduleOpen);
        }
      }

      // When the menu is not visible and not scheduled already
      // then schedule it for opening
      else if (this._scheduleOpen != menu)
      {
        menu.debug("Schedule open");
        this._scheduleOpen = menu;
        this._openTimer.restartWith(menu.getOpenInterval());
      }
    },

    scheduleClose : function(menu)
    {
      // Cancel open of the menu first
      this.cancelOpen(menu);

      // When the menu is already invisible
      if (!menu.isVisible())
      {
        // Cancel all other close requests
        if (this._scheduleClose) {
          this.cancelClose(this._scheduleClose);
        }
      }

      // When the menu is visible and not scheduled already
      // then schedule it for closing
      else if (this._scheduleClose != menu)
      {
        menu.debug("Schedule close");
        this._scheduleClose = menu;
        this._closeTimer.restartWith(menu.getCloseInterval());
      }
    },

    cancelOpen : function(menu)
    {
      if (this._scheduleOpen == menu)
      {
        menu.debug("Cancel open");
        this._openTimer.stop();
        this._scheduleOpen = null;
      }
    },

    cancelClose : function(menu)
    {
      if (this._scheduleClose == menu)
      {
        menu.debug("Cancel close");
        this._closeTimer.stop();
        this._scheduleClose = null;
      }
    },




    /*
    ---------------------------------------------------------------------------
      TIMER EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    _onOpenInterval : function(e)
    {
      var menu = this._scheduleOpen;

      menu.debug("Interval open");
      this._openTimer.stop();
      this._scheduleOpen = null;

      menu.open();
    },

    _onCloseInterval : function(e)
    {
      var menu = this._scheduleClose;

      menu.debug("Interval close");
      this._closeTimer.stop();
      this._scheduleClose = null;

      menu.exclude();
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for mousedown events
     *
     * @param e {qx.event.type.Mouse} mousedown event
     */
    _onMouseDown : function(e)
    {
      var target = e.getTarget();

      // If the target is the one which has opened the current menu
      // we ignore the mousedown to let the button process the event
      // further with toggling or ignoring the click.
      if (target.getMenu && target.getMenu() && target.getMenu().isVisible()) {
        return;
      }

      // All clicks not inside a menu will hide all currently open menus
      if (!this._isInMenu(target)) {
        this.hideAll();
      }
    },


    /**
     * Event handler for mouseup events
     *
     * @param e {qx.event.type.Mouse} mouseup event
     */
    _onMouseUp : function(e)
    {
      var target = e.getTarget();

      // All mouseups not exactly clicking on the menu hide all currently
      // open menus.
      // Separators for example are anonymous. This way the
      // target is the menu. It is a wanted behavior that clicks on
      // separators are ignored completely.
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

        case "Escape":
          this.hideAll();
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
      // Query for previous child
      var selected = menu.getSelected();
      var start = selected ? menu.indexOf(selected)-1 : children.length-1;
      var nextItem = this._getChild(menu, start, -1, true);

      // Reconfigure property
      if (nextItem) {
        menu.setSelected(nextItem);
      } else {
        menu.resetSelected();
      }
    },


    /**
     * Event handler for <code>Down</code> key
     *
     * @return {void}
     */
    _onKeyPressDown : function(menu)
    {
      // Query for next child
      var selected = menu.getSelected();
      var start = selected ? menu.indexOf(selected)+1 : 0;
      var nextItem = this._getChild(menu, start, 1, true);

      // Reconfigure property
      if (nextItem) {
        menu.setSelected(nextItem);
      } else {
        menu.resetSelected();
      }
    },


    /**
     * Event handler for <code>Left</code> key
     *
     * @return {void}
     */
    _onKeyPressLeft : function(menu)
    {
      var menuOpener = menu.getOpener();
      if (!menuOpener) {
        return;
      }

      // Back to the "parent" menu
      if (menuOpener instanceof qx.ui.menu.Button)
      {
        var parentMenu = menuOpener.getLayoutParent();

        parentMenu.resetOpened();
        parentMenu.setSelected(menuOpener);
      }

      // Goto the previous toolbar button
      else if (menuOpener instanceof qx.ui.toolbar.MenuButton)
      {
        var buttons = menuOpener.getToolBar().getMenuButtons();
        var index = buttons.indexOf(menuOpener);

        // This should not happen, definitely!
        if (index === -1) {
          return;
        }

        var prevButton = index == 0 ? buttons[buttons.length-1] : buttons[index-1];
        if (prevButton != menuOpener) {
          prevButton.open(true);
        }
      }
    },


    /**
     * Event handler for <code>Right</code> key
     *
     * @return {void}
     */
    _onKeyPressRight : function(menu)
    {
      var selected = menu.getSelected();

      // Open sub-menu of hovered item and select first child
      if (selected)
      {
        var subMenu = selected.getMenu();

        if (subMenu)
        {
          // open previously hovered item
          menu.setOpened(selected);

          // hover first item in new submenu
          var first = this._getChild(subMenu, 0, 1);
          if (first) {
            subMenu.setSelected(first);
          }

          return;
        }
      }

      // No hover and no open item
      // When first button has a menu, open it, otherwise only hover it
      else if (!menu.getOpened())
      {
        var first = this._getChild(menu, 0, 1);

        if (first)
        {
          menu.setSelected(first);

          if (first.getMenu()) {
            menu.setOpened(first);
          }

          return;
        }
      }

      // Jump to the next toolbar button
      var menuOpener = menu.getOpener();

      // Look up opener hierarchy for menu button
      if (menuOpener instanceof qx.ui.menu.Button && selected)
      {
        while (menuOpener)
        {
          menuOpener = menuOpener.getLayoutParent();
          if (menuOpener instanceof qx.ui.menu.Menu)
          {
            menuOpener = menuOpener.getOpener();
            if (menuOpener instanceof qx.ui.toolbar.MenuButton) {
              break;
            }
          }
          else
          {
            break;
          }
        }

        if (!menuOpener) {
          return;
        }
      }

      // Ask the toolbar for the next menu button
      if (menuOpener instanceof qx.ui.toolbar.MenuButton)
      {
        var buttons = menuOpener.getToolBar().getMenuButtons();
        var index = buttons.indexOf(menuOpener);

        // This should not happen, definitely!
        if (index === -1) {
          return;
        }

        var nextButton = buttons[index+1];
        if (!nextButton) {
          nextButton = buttons[0];
        }

        if (nextButton != menuOpener) {
          nextButton.open(true);
        }
      }
    },


    /**
     * Event handler for <code>Enter</code> key
     *
     * @return {void}
     */
    _onKeyPressEnter : function(menu)
    {
      var selected = menu.getSelected();

      if (selected) {
        selected.execute();
      }

      this.hideAll();
    }
  }
});
