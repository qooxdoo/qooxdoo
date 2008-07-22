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

    // Register mouse listeners
    this.addListener("mouseover", this._onMouseOver);
    this.addListener("mouseout", this._onMouseOut);
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
      WIDGET PROPERTIES
    ---------------------------------------------------------------------------
    */

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



    /*
    ---------------------------------------------------------------------------
      STYLE OPTIONS
    ---------------------------------------------------------------------------
    */

    /** Horizontal offset in pixels of the sub menu  */
    submenuOffsetX :
    {
      check : "Integer",
      themeable : true,
      init : 0
    },

    /** Vertical offset in pixels of the sub menu */
    submenuOffsetY :
    {
      check : "Integer",
      themeable : true,
      init : 0
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




    /*
    ---------------------------------------------------------------------------
      FUNCTIONALITY PROPERTIES
    ---------------------------------------------------------------------------
    */

    selected :
    {
      check : "qx.ui.core.Widget",
      nullable : true,
      apply : "_applySelected"
    },

    opened :
    {
      check : "qx.ui.core.Widget",
      nullable : true,
      apply : "_applyOpened"
    },

    /** Widget that opened the menu */
    opener :
    {
      check : "qx.ui.core.Widget",
      nullable : true
    },




    /*
    ---------------------------------------------------------------------------
      BEHAVIOR PROPERTIES
    ---------------------------------------------------------------------------
    */

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
     * Opens the menu and configures the opener
     *
     * @param opener {qx.ui.core.Widget} Any widget
     */
    open : function(opener)
    {
      if (opener != null) {
        this.setOpener(opener);
      }

      this.show();
    },


    /**
     * Set the popup's position relative to its parent
     *
     * @param left {Integer} The left position
     * @param top {Integer} The top position
     */
    moveTo : function(left, top) {
      this.setLayoutProperties({ left: left, top: top });
    },


    /**
     * Convenience method to add a separator to the menu
     */
    addSeparator : function() {
      this.add(new qx.ui.menu.Separator);
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

        this.resetOpened();
        this.resetSelected();
      }

      var opener = this.getOpener();
      if (opener)
      {
        var menu = opener.getLayoutParent();
        if (menu instanceof qx.ui.menu.Menu) {
          value === "visible" ? menu.setOpened(opener) : menu.resetOpened();
        }
      }
    },


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
    _applySelected : function(value, old)
    {
      var open = this.getOpened();

      if (old && open != old) {
        old.removeState("selected");
      }

      if (value)
      {
        if (open && open != value) {
          open.removeState("selected");
        }

        value.addState("selected");
      }
    },


    // property apply
    _applyOpened : function(value, old)
    {
      if (old)
      {
        var oldSubMenu = old.getMenu();
        if (oldSubMenu)
        {
          // Reset opener
          oldSubMenu.resetOpener();

          // Hide old menu
          oldSubMenu.exclude();

          // Clear hovered state
          old.removeState("selected");
        }
      }

      if (value)
      {
        var subMenu = value.getMenu();

        if (subMenu)
        {
          // Configure opener
          subMenu.setOpener(value);

          // Move to correct position
          var buttonLocation = value.getContainerLocation();
          subMenu.moveTo(buttonLocation.right + this.getSubmenuOffsetX(),
            buttonLocation.top + this.getSubmenuOffsetY());

          // And finally display it
          subMenu.show();
        }

        // The button should be hovered when the menu is open
        value.addState("selected");
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
      // Force hovered state on opener
      var opener = this.getOpener();
      if (opener) {
        opener.addState("selected");
      }

      // Process inner target
      var target = e.getTarget();
      if (target.isEnabled() && target instanceof qx.ui.menu.Button)
      {
        this.setSelected(target);

        var mgr = qx.ui.menu.Manager.getInstance();
        var openItem = this.getOpened();

        // Cancel all other scheduled requests
        mgr.cancelAll();

        if (openItem)
        {
          // Ignore when new target is already open
          if (openItem == target) {
            return;
          }

          // Otherwise schedule a close of the current menu
          mgr.scheduleClose(openItem.getMenu());
        }

        // Schedule opening of the new menu
        if (target.getMenu && target.getMenu())
        {
          target.getMenu().setOpener(target);
          mgr.scheduleOpen(target.getMenu());
        }
      }
      else
      {
        this.resetSelected();
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
      var target = e.getTarget();
      if (target == this.getSelected()) {
        this.resetSelected();
      }
    }
  }
});
