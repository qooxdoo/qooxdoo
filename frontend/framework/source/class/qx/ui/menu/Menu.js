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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.menu.Menu",
{
  extend : qx.ui.core.Widget,
  include : qx.ui.core.MChildrenHandling,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Use hard coded layout
    this._setLayout(new qx.ui.layout.Menu);

    // Automatically add to application's root
    qx.core.Init.getApplication().getRoot().add(this);

    // Create timers
    this._openTimer = new qx.event.Timer;
    this._closeTimer = new qx.event.Timer;

    // Register timer listeners
    this._openTimer.addListener("interval", this._onOpenInterval, this);
    this._closeTimer.addListener("interval", this._onCloseInterval, this);

    // Register mouse listeners
    this.addListener("mouseover", this._onMouseOver);
    this.addListener("mouseout", this._onMouseOut);

    // Register key listeners
    this.addListener("keypress", this._onKeyPress);

    // Initialize timers
    this.initOpenInterval();
    this.initCloseInterval();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "menu"
    },

    // overridden
    allowGrowX :
    {
      refine : true,
      init: false
    },

    // overridden
    allowGrowY :
    {
      refine : true,
      init: false
    },

    // overridden
    visibility :
    {
      refine : true,
      init : "excluded"
    },

    // overridden
    keepFocus :
    {
      refine : true,
      init : true
    },




    /** The spacing between each cell of the menu buttons */
    spacingX :
    {
      check : "Integer",
      apply : "_applySpacingX",
      init : 0,
      themeable : true
    },

    /** The spacing between each menu button */
    spacingY :
    {
      check : "Integer",
      apply : "_applySpacingY",
      init : 0,
      themeable : true
    },

    /** Default icon column width if no icons are rendered */
    iconColumnWidth :
    {
      check : "Integer",
      init : 0,
      themeable : true,
      apply : "_applyIconColumnWidth"
    },

    /** Default arrow column width if no sub menus are rendered */
    arrowColumnWidth :
    {
      check : "Integer",
      init : 0,
      themeable : true,
      apply : "_applyArrowColumnWidth"
    },




    hoverItem :
    {
      check : "qx.ui.core.Widget",
      nullable : true,
      apply : "_applyHoverItem"
    },

    openItem :
    {
      check : "qx.ui.core.Widget",
      nullable : true,
      apply : "_applyOpenItem"
    },

    /** Widget that opened the menu */
    opener :
    {
      check : "qx.ui.core.Widget",
      nullable : true
    },

    /** Reference to the parent menu if the menu is a submenu */
    parentMenu :
    {
      check : "qx.ui.menu.Menu",
      nullable : true
    },




    /** Controls whether the menus getting re-opened fast or not */
    fastReopen :
    {
      check : "Boolean",
      themeable : true,
      init : false
    },

    /** Interval in ms after which sub menus should be openend */
    openInterval :
    {
      check : "Integer",
      themeable : true,
      init : 250,
      apply : "_applyOpenInterval"
    },

    /** Interval in ms after which sub menus should be closed  */
    closeInterval :
    {
      check : "Integer",
      themeable : true,
      init : 250,
      apply : "_applyCloseInterval"
    },

    /** Horizontal offset in pixels of the sub menu  */
    subMenuHorizontalOffset :
    {
      check : "Integer",
      themeable : true,
      init : -3
    },

    /** Vertical offset in pixels of the sub menu */
    subMenuVerticalOffset :
    {
      check : "Integer",
      themeable : true,
      init : -2
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
      USER API
    ---------------------------------------------------------------------------
    */

    /**
     * Set the popup's position relative to its parent
     *
     * @param left {Integer} The left position
     * @param top {Integer} The top position
     */
    moveTo : function(left, top)
    {
      this.setLayoutProperties({
        left : left,
        top : top
      });
    },




    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyVisibility : function(value, old)
    {
      this.base(arguments, value, old);

      var mgr = qx.ui.menu.Manager.getInstance();

      if (value === "visible")
      {
        mgr.add(this);
      }
      else
      {
        mgr.remove(this);

        this.resetHoverItem();
        this.resetOpenItem();
      }
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT UTILS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the column sizes detected during the pre-layout phase
     *
     * @return {Array} List of all column widths
     */
    getColumnSizes : function() {
      return this._getLayout().getColumnSizes();
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIconColumnWidth : function(value, old) {
      this._getLayout().setIconColumnWidth(value);
    },


    // property apply
    _applyArrowColumnWidth : function(value, old) {
      this._getLayout().setArrowColumnWidth(value);
    },


    // property apply
    _applySpacingX : function(value, old) {
      this._getLayout().setColumnSpacing(value);
    },


    // property apply
    _applySpacingY : function(value, old) {
      this._getLayout().setSpacing(value);
    },


    // property apply
    _applyOpenInterval : function(value, old) {
      this._openTimer.setInterval(value);
    },


    // property apply
    _applyCloseInterval : function(value, old) {
      this._closeTimer.setInterval(value);
    },


    // property apply
    _applyHoverItem : function(value, old)
    {
      if (old) {
        old.removeState("hovered");
      }

      if (value) {
        value.addState("hovered");
      }
    },


    // property apply
    _applyOpenItem : function(value, old)
    {
      if (old)
      {
        var oldSubMenu = old.getMenu();

        if (oldSubMenu)
        {
          oldSubMenu.resetParentMenu();
          oldSubMenu.resetOpener();
          oldSubMenu.exclude();
        }
      }

      if (value)
      {
        var subMenu = value.getMenu();

        if (subMenu)
        {
          subMenu.setOpener(value);
          subMenu.setParentMenu(this);

          var buttonLocation = value.getContainerLocation();
          subMenu.moveTo(buttonLocation.right + this.getSubMenuHorizontalOffset(),
            buttonLocation.top + this.getSubMenuVerticalOffset());

          subMenu.show();
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onMouseOver : function(e)
    {
      // HANDLE PARENT MENU

      // look if we have a parent menu
      // if so we need to stop the close event started there
      var parentMenu = this.getParentMenu();

      if (parentMenu)
      {
        // stop the close event
        parentMenu._closeTimer.stop();

        // look if we have a menuOpener, too (normally this should be)
        var menuOpener = this.getOpener();

        // then setup it to look hovered
        if (menuOpener) {
          parentMenu.setHoverItem(menuOpener);
        }
      }



      // HANDLING FOR HOVERING MYSELF

      var eventTarget = e.getTarget();

      if (eventTarget == this)
      {
        this._openTimer.stop();
        this._closeTimer.start();

        this.resetHoverItem();

        return;
      }



      // HANDLING FOR HOVERING ITEMS

      var openItem = this.getOpenItem();

      // if we have a open item
      if (openItem)
      {
        this.setHoverItem(eventTarget);
        this._openTimer.stop();

        // if the new one has also a sub menu
        if (eventTarget.getMenu())
        {
          // check if we should use fast reopen (this will open the menu instantly)
          if (this.getFastReopen())
          {
            this.setOpenItem(eventTarget);
            this._closeTimer.stop();
          }

          // otherwise we use the default timer interval
          else
          {
            this._openTimer.start();
          }
        }

        // otherwise start the close timer for the old menu
        else
        {
          this._closeTimer.start();
        }
      }

      // otherwise handle the mouseover and restart the timer
      else
      {
        this.setHoverItem(eventTarget);

        // stop timer for the last open request
        this._openTimer.stop();

        // and restart it if the new one has a menu, too
        if (eventTarget.getMenu()) {
          this._openTimer.start();
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onMouseOut : function(e)
    {
      // stop the open timer (for any previous open requests)
      this._openTimer.stop();

      // start the close timer to hide a menu if needed
      var eventTarget = e.getTarget();

      if (eventTarget != this && eventTarget.getMenu()) {
        this._closeTimer.start();
      }

      // reset the current hover item
      this.resetHoverItem();
    },





    /*
    ---------------------------------------------------------------------------
      INTERVAL EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onOpenInterval : function(e)
    {
      // stop the open timer (we need only the first interval)
      this._openTimer.stop();

      // if we have a item which is currently hovered, open it
      var hoverItem = this.getHoverItem();

      if (hoverItem && hoverItem.getMenu()) {
        this.setOpenItem(hoverItem);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onCloseInterval : function(e)
    {
      // stop the close timer (we need only the first interval)
      this._closeTimer.stop();

      // reset the current opened item
      this.resetOpenItem();
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
      switch(e.getKeyIdentifier())
      {
        case "Up":
          this._onKeyPressUp();
          break;

        case "Down":
          this._onKeyPressDown();
          break;

        case "Left":
          this._onKeyPressLeft();
          break;

        case "Right":
          this._onKeyPressRight();
          break;

        case "Enter":
          this._onKeyPressEnter();
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
    _onKeyPressUp : function()
    {
      var children = this.getChildren();

      var hoverItem = this.getHoverItem();
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
        this.setHoverItem(nextItem);
      } else {
        this.resetHoverItem();
      }
    },


    /**
     * Event handler for <code>Down</code> key
     *
     * @return {void}
     */
    _onKeyPressDown : function()
    {
      var children = this.getChildren();

      var hoverItem = this.getHoverItem();
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
        this.setHoverItem(nextItem);
      } else {
        this.resetHoverItem();
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
    _onKeyPressRight : function()
    {
      var hoverItem = this.getHoverItem();

      if (hoverItem)
      {
        var menu = hoverItem.getMenu();

        if (menu)
        {
          this.setOpenItem(hoverItem);

          // mark first item in new submenu
          menu.setHoverItem(menu.getFirstActiveChild());

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
