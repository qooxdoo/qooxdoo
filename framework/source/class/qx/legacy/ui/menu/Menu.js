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
 *
 * If you create a new menu using {@link qx.legacy.ui.menu.Menu}, do not forget
 * to add it to the client document using its <i>addToDocument()</i> method,
 * or the menu will not be positioned correctly in the application.
 *
 * @appearance menu
 */
qx.Class.define("qx.legacy.ui.menu.Menu",
{
  extend : qx.legacy.ui.popup.Popup,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Layout
    var l = this._layout = new qx.legacy.ui.menu.Layout;
    l.setEdge(0);
    this.add(l);

    // Timer
    this.initOpenInterval();
    this.initCloseInterval();

    // Event Listeners
    this.addListener("mouseover", this._onmouseover);
    this.addListener("mousemove", this._onmouseover);
    this.addListener("mouseout", this._onmouseout);

    this.addListener("keydown", this._onkeydown);
    this.addListener("keypress", this._onKeyPress);

    // Activate remapping
    this.remapChildrenHandlingTo(this._layout);

    // Initialize properties
    this.initWidth();
    this.initHeight();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    appearance :
    {
      refine : true,
      init : "menu"
    },

    width :
    {
      refine : true,
      init : "auto"
    },

    height :
    {
      refine : true,
      init : "auto"
    },

    /** Gap in pixels between the icon and the content of a menu entry */
    iconContentGap :
    {
      check : "Integer",
      themeable : true,
      init : 4
    },

    /** Gap in pixels between the label and the shortcut (for the command) of a menu entry */
    labelShortcutGap :
    {
      check : "Integer",
      themeable : true,
      init : 10
    },

    /** Gap in pixels between the content and the arrow for a sub menu of a menu entry */
    contentArrowGap :
    {
      check : "Integer",
      themeable : true,
      init : 8
    },

    /** Padding of the content of a menu entry when no icon is used */
    contentNonIconPadding :
    {
      check : "Integer",
      themeable : true,
      init : 20
    },

    /** Padding of the content of a menu entry when no arrow is used */
    contentNonArrowPadding :
    {
      check : "Integer",
      themeable : true,
      init : 8
    },

    hoverItem :
    {
      check : "qx.legacy.ui.core.Widget",
      nullable : true,
      apply : "_applyHoverItem"
    },

    openItem :
    {
      check : "qx.legacy.ui.core.Widget",
      nullable : true,
      apply : "_applyOpenItem"
    },

    /** Widget that opened the menu */
    opener :
    {
      check : "qx.legacy.ui.core.Widget",
      nullable : true
    },

    /** Reference to the parent menu if the menu is a submenu */
    parentMenu :
    {
      check : "qx.legacy.ui.menu.Menu",
      nullable : true
    },

    /** Controls whether the menus getting re-opened fast or not */
    fastReopen :
    {
      check : "Boolean",
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
    },

    /** Controls whether the shortcuts should be indented or not  */
    indentShortcuts :
    {
      check : "Boolean",
      init : true
    }
  },



  defer : function(statics, members)
  {
    qx.legacy.core.Property.addCachedProperty({ name : "maxIconWidth" }, members);
    qx.legacy.core.Property.addCachedProperty({ name : "maxLabelWidth" }, members);
    qx.legacy.core.Property.addCachedProperty({ name : "maxLabelWidthIncShortcut" }, members);
    qx.legacy.core.Property.addCachedProperty({ name : "maxShortcutWidth" }, members);
    qx.legacy.core.Property.addCachedProperty({ name : "maxArrowWidth" }, members);
    qx.legacy.core.Property.addCachedProperty({ name : "maxContentWidth" }, members);
    qx.legacy.core.Property.addCachedProperty({ name : "iconPosition", defaultValue : 0 }, members);
    qx.legacy.core.Property.addCachedProperty({ name : "labelPosition" }, members);
    qx.legacy.core.Property.addCachedProperty({ name : "shortcutPosition" }, members);
    qx.legacy.core.Property.addCachedProperty({ name : "arrowPosition" }, members);
    qx.legacy.core.Property.addCachedProperty({ name : "menuButtonNeededWidth" }, members);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _remappingChildTable : [ "add", "remove", "addAt", "addAtBegin", "addAtEnd", "removeAt", "addBefore", "addAfter", "removeAll", "getFirstChild", "getFirstActiveChild", "getLastChild", "getLastActiveChild" ],




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
    getLayout : function() {
      return this._layout;
    },


    /**
     * Returns if the given element is a child of this menu
     *
     * @param vElement {Object} element to test
     * @param vButtonsOnly {boolean ? false} if true, child elements other than buttons
     *                                         will be ignored
     */
    isSubElement : function(vElement, vButtonsOnly)
    {
      if (
      // accept this as child, this can happen if a scrollbar is clicked upon in
      // a context menu
      (vElement.getParent() === this._layout) || ((!vButtonsOnly) && (vElement === this))) {
        return true;
      }

      for (var a=this._layout.getChildren(), l=a.length, i=0; i<l; i++)
      {
        if (a[i].getMenu && a[i].getMenu() && a[i].getMenu().isSubElement(vElement, vButtonsOnly)) {
          return true;
        }
      }

      return false;
    },




    /*
    ---------------------------------------------------------------------------
      APPEAR/DISAPPEAR
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {void}
     */
    _beforeAppear : function()
    {
      // Intentionally bypass superclass and call super.super._beforeAppear
      qx.legacy.ui.layout.CanvasLayout.prototype._beforeAppear.call(this);

      // register to menu manager as active widget
      qx.legacy.ui.menu.Manager.getInstance().add(this);

      // zIndex handling
      this.bringToFront();

      // setup as global active widget
      this._makeActive();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _beforeDisappear : function()
    {
      // Intentionally bypass superclass and call super.super._beforeDisappear
      qx.legacy.ui.layout.CanvasLayout.prototype._beforeDisappear.call(this);

      // deregister as opened from qx.legacy.ui.menu.Manager
      qx.legacy.ui.menu.Manager.getInstance().remove(this);

      // reset global active widget
      this._makeInactive();

      // reset properties on close
      this.setHoverItem(null);
      this.setOpenItem(null);

      // be sure that the opener button gets the correct state
      var vOpener = this.getOpener();

      if (vOpener) {
        vOpener.removeState("pressed");
      }
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyOpenInterval : function(value, old)
    {
      if (!this._openTimer) {
        this._openTimer = new qx.event.Timer(value);
        this._openTimer.addListener("interval", this._onopentimer, this);
      } else {
        this._openTimer.setInterval(value);
      }
    },


    // property apply
    _applyCloseInterval : function(value, old)
    {
      if (!this._closeTimer) {
        this._closeTimer = new qx.event.Timer(this.getCloseInterval());
        this._closeTimer.addListener("interval", this._onclosetimer, this);
      } else {
        this._closeTimer.setInterval(value);
      }
    },


    // property apply
    _applyHoverItem : function(value, old)
    {
      if (old) {
        old.removeState("over");
      }

      if (value) {
        value.addState("over");
      }
    },


    // property apply
    _applyOpenItem : function(value, old)
    {
      if (old)
      {
        var vOldSub = old.getMenu();

        if (vOldSub)
        {
          vOldSub.setParentMenu(null);
          vOldSub.setOpener(null);
          vOldSub.hide();
        }
      }

      if (value)
      {
        var vSub = value.getMenu();

        if (vSub)
        {
          vSub.setOpener(value);
          vSub.setParentMenu(this);

          var pl = value.getElement();
          var el = this.getElement();

          vSub.setTop(qx.bom.element.Location.getTop(pl) + this.getSubMenuVerticalOffset());
          vSub.setLeft(qx.bom.element.Location.getLeft(el) + qx.legacy.html.Dimension.getBoxWidth(el) + this.getSubMenuHorizontalOffset());

          vSub.show();
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
      MAX WIDTH COMPUTERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computeMaxIconWidth : function()
    {
      var ch = this.getLayout().getChildren(), chl = ch.length, chc, m = 0;

      for (var i=0; i<chl; i++)
      {
        chc = ch[i];

        if (chc.hasIcon())
        {
          // Make static as long as not supported well
          // m = Math.max(m, chc.getIconObject().getPreferredBoxWidth());
          m = Math.max(m, 16);
        }
      }

      return m;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computeMaxLabelWidth : function()
    {
      var ch = this.getLayout().getChildren(), chl = ch.length, chc, m = 0;

      for (var i=0; i<chl; i++)
      {
        chc = ch[i];

        if (chc.hasLabel()) {
          m = Math.max(m, chc.getLabelObject().getPreferredBoxWidth());
        }
      }

      return m;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computeMaxLabelWidthIncShortcut : function()
    {
      var ch = this.getLayout().getChildren(), chl = ch.length, chc, m = 0;

      for (var i=0; i<chl; i++)
      {
        chc = ch[i];

        if (chc.hasLabel() && chc.hasShortcut()) {
          m = Math.max(m, chc.getLabelObject().getPreferredBoxWidth());
        }
      }

      return m;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computeMaxShortcutWidth : function()
    {
      var ch = this.getLayout().getChildren(), chl = ch.length, chc, m = 0;

      for (var i=0; i<chl; i++)
      {
        chc = ch[i];

        if (chc.hasShortcut()) {
          m = Math.max(m, chc.getShortcutObject().getPreferredBoxWidth());
        }
      }

      return m;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computeMaxArrowWidth : function()
    {
      var ch = this.getLayout().getChildren(), chl = ch.length, chc, m = 0;

      for (var i=0; i<chl; i++)
      {
        chc = ch[i];

        if (chc.hasMenu())
        {
          // Make static as long as not supported well
          // m = Math.max(m, chc.getArrowObject().getPreferredBoxWidth());
          m = Math.max(m, 4);
        }
      }

      return m;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computeMaxContentWidth : function()
    {
      var vSum;

      var lw = this.getMaxLabelWidth();
      var sw = this.getMaxShortcutWidth();

      if (this.getIndentShortcuts())
      {
        var vTemp = sw + this.getMaxLabelWidthIncShortcut();

        if (sw > 0) {
          vTemp += this.getLabelShortcutGap();
        }

        vSum = Math.max(lw, vTemp);
      }
      else
      {
        vSum = lw + sw;

        if (lw > 0 && sw > 0) {
          vSum += this.getLabelShortcutGap();
        }
      }

      return vSum;
    },




    /*
    ---------------------------------------------------------------------------
      LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
      POSITION COMPUTERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {int} TODOC
     */
    _computeIconPosition : function() {
      return 0;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computeLabelPosition : function()
    {
      var v = this.getMaxIconWidth();
      return v > 0 ? v + this.getIconContentGap() : this.getContentNonIconPadding();
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computeShortcutPosition : function() {
      return this.getLabelPosition() + this.getMaxContentWidth() - this.getMaxShortcutWidth();
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computeArrowPosition : function()
    {
      var v = this.getMaxContentWidth();
      return this.getLabelPosition() + (v > 0 ? v + this.getContentArrowGap() : v);
    },




    /*
    ---------------------------------------------------------------------------
      LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
      INVALIDATION OF CACHE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {void}
     */
    _invalidateMaxIconWidth : function()
    {
      this._cachedMaxIconWidth = null;

      this._invalidateLabelPosition();
      this._invalidateMenuButtonNeededWidth();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _invalidateMaxLabelWidth : function()
    {
      this._cachedMaxLabelWidth = null;
      this._cachedMaxArrowWidth = null;

      this._invalidateShortcutPosition();
      this._invalidateMaxLabelWidthIncShortcut();
      this._invalidateMaxContentWidth();
      this._invalidateMenuButtonNeededWidth();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _invalidateMaxShortcutWidth : function()
    {
      this._cachedMaxShortcutWidth = null;

      this._invalidateArrowPosition();
      this._invalidateMaxContentWidth();
      this._invalidateMenuButtonNeededWidth();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _invalidateLabelPosition : function()
    {
      this._cachedLabelPosition = null;
      this._invalidateShortcutPosition();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _invalidateShortcutPosition : function()
    {
      this._cachedShortcutPosition = null;
      this._invalidateArrowPosition();
    },




    /*
    ---------------------------------------------------------------------------
      LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
      NEEDED WIDTH COMPUTERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computeMenuButtonNeededWidth : function()
    {
      var vSum = 0;

      var vMaxIcon = this.getMaxIconWidth();
      var vMaxContent = this.getMaxContentWidth();
      var vMaxArrow = this.getMaxArrowWidth();

      if (vMaxIcon > 0) {
        vSum += vMaxIcon;
      } else {
        vSum += this.getContentNonIconPadding();
      }

      if (vMaxContent > 0)
      {
        if (vMaxIcon > 0) {
          vSum += this.getIconContentGap();
        }

        vSum += vMaxContent;
      }

      if (vMaxArrow > 0)
      {
        if (vMaxIcon > 0 || vMaxContent > 0) {
          vSum += this.getContentArrowGap();
        }

        vSum += vMaxArrow;
      }
      else
      {
        vSum += this.getContentNonArrowPadding();
      }

      return vSum;
    },




    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseover : function(e)
    {
      /* ------------------------------
        HANDLE PARENT MENU
      ------------------------------ */

      // look if we have a parent menu
      // if so we need to stop the close event started there
      var vParent = this.getParentMenu();

      if (vParent)
      {
        // stop the close event
        vParent._closeTimer.stop();

        // look if we have a opener, too (normally this should be)
        var vOpener = this.getOpener();

        // then setup it to look hovered
        if (vOpener) {
          vParent.setHoverItem(vOpener);
        }
      }

      /* ------------------------------
        HANDLING FOR HOVERING MYSELF
      ------------------------------ */

      var t = e.getTarget();

      if (t == this)
      {
        this._openTimer.stop();
        this._closeTimer.start();

        this.setHoverItem(null);

        return;
      }

      /* ------------------------------
        HANDLING FOR HOVERING ITEMS
      ------------------------------ */

      var vOpen = this.getOpenItem();

      // if we have a open item
      if (vOpen)
      {
        this.setHoverItem(t);
        this._openTimer.stop();

        // if the new one has also a sub menu
        if (t.hasMenu())
        {
          // check if we should use fast reopen (this will open the menu instantly)
          if (this.getFastReopen())
          {
            this.setOpenItem(t);
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
        this.setHoverItem(t);

        // stop timer for the last open request
        this._openTimer.stop();

        // and restart it if the new one has a menu, too
        if (t.hasMenu()) {
          this._openTimer.start();
        }
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseout : function(e)
    {
      // stop the open timer (for any previous open requests)
      this._openTimer.stop();

      // start the close timer to hide a menu if needed
      var t = e.getTarget();

      if (t != this && t.hasMenu()) {
        this._closeTimer.start();
      }

      // reset the current hover item
      this.setHoverItem(null);
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onopentimer : function(e)
    {
      // stop the open timer (we need only the first interval)
      this._openTimer.stop();

      // if we have a item which is currently hovered, open it
      var vHover = this.getHoverItem();

      if (vHover && vHover.hasMenu()) {
        this.setOpenItem(vHover);
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onclosetimer : function(e)
    {
      // stop the close timer (we need only the first interval)
      this._closeTimer.stop();

      // reset the current opened item
      this.setOpenItem(null);
    },


    /**
     * Wraps key events to target functions
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeydown : function(e)
    {
      if (e.getKeyIdentifier() == "Enter") {
        this._onkeydown_enter(e);
      }

      e.preventDefault();
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onKeyPress : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Up":
          this._onKeyPress_up(e);
          break;

        case "Down":
          this._onKeyPress_down(e);
          break;

        case "Left":
          this._onKeyPress_left(e);
          break;

        case "Right":
          this._onKeyPress_right(e);
          break;

        default:
          return;
      }

      // Stop all matching events
      e.preventDefault();
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onKeyPress_up : function(e)
    {
      var vHover = this.getHoverItem();
      var vPrev = vHover ? vHover.isFirstChild() ? this.getLastActiveChild() : vHover.getPreviousActiveSibling([ qx.legacy.ui.menu.Separator ]) : this.getLastActiveChild();

      this.setHoverItem(vPrev);
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onKeyPress_down : function(e)
    {
      var vHover = this.getHoverItem();
      var vNext = vHover ? vHover.isLastChild() ? this.getFirstActiveChild() : vHover.getNextActiveSibling([ qx.legacy.ui.menu.Separator ]) : this.getFirstActiveChild();

      this.setHoverItem(vNext);
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onKeyPress_left : function(e)
    {
      var vOpener = this.getOpener();

      // Jump to the "parent" qx.legacy.ui.menu.Menu
      if (vOpener instanceof qx.legacy.ui.menu.Button)
      {
        var vOpenerParent = this.getOpener().getParentMenu();

        vOpenerParent.setOpenItem(null);
        vOpenerParent.setHoverItem(vOpener);

        vOpenerParent._makeActive();
      }

      // Jump to the previous ToolBarMenuButton
      else if (vOpener instanceof qx.legacy.ui.toolbar.MenuButton)
      {
        var vToolBar = vOpener.getParentToolBar();

        // change active widget to new button
        this.getFocusRoot().setActiveChild(vToolBar);

        // execute toolbars keydown implementation
        vToolBar._onKeyPress(e);
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onKeyPress_right : function(e)
    {
      var vHover = this.getHoverItem();

      if (vHover)
      {
        var vMenu = vHover.getMenu();

        if (vMenu)
        {
          this.setOpenItem(vHover);

          // mark first item in new submenu
          vMenu.setHoverItem(vMenu.getFirstActiveChild());

          return;
        }
      }
      else if (!this.getOpenItem())
      {
        var vFirst = this.getLayout().getFirstActiveChild();

        if (vFirst) {
          vFirst.hasMenu() ? this.setOpenItem(vFirst) : this.setHoverItem(vFirst);
        }
      }

      // Jump to the next ToolBarMenuButton
      var vOpener = this.getOpener();

      if (vOpener instanceof qx.legacy.ui.toolbar.MenuButton)
      {
        var vToolBar = vOpener.getParentToolBar();

        // change active widget to new button
        this.getFocusRoot().setActiveChild(vToolBar);

        // execute toolbars keydown implementation
        vToolBar._onKeyPress(e);
      }
      else if (vOpener instanceof qx.legacy.ui.menu.Button && vHover)
      {
        // search for menubar if existing
        // menu -> button -> menu -> button -> menu -> menubarbutton -> menubar
        var vOpenerParent = vOpener.getParentMenu();

        while (vOpenerParent && vOpenerParent instanceof qx.legacy.ui.menu.Menu)
        {
          vOpener = vOpenerParent.getOpener();

          if (vOpener instanceof qx.legacy.ui.menu.Button) {
            vOpenerParent = vOpener.getParentMenu();
          }
          else
          {
            if (vOpener) {
              vOpenerParent = vOpener.getParent();
            }

            break;
          }
        }

        if (vOpenerParent instanceof qx.legacy.ui.toolbar.Part) {
          vOpenerParent = vOpenerParent.getParent();
        }

        if (vOpenerParent instanceof qx.legacy.ui.toolbar.ToolBar)
        {
          // jump to next menubarbutton
          this.getFocusRoot().setActiveChild(vOpenerParent);
          vOpenerParent._onKeyPress(e);
        }
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeydown_enter : function(e)
    {
      var vHover = this.getHoverItem();

      if (vHover) {
        vHover.execute();
      }

      qx.legacy.ui.menu.Manager.getInstance().update();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.hide();
    this._disposeObjects("_openTimer", "_closeTimer", "_layout");
  }
});
