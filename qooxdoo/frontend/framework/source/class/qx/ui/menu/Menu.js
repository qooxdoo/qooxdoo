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
    this.getApplicationRoot().add(this);

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
    open : function()
    {
      // Move to correct position
      var opener = this.getOpener();
      if (opener instanceof qx.ui.menu.Button)
      {
        var buttonLocation = opener.getContainerLocation();
        this.moveTo(buttonLocation.right + this.getSubmenuOffsetX(),
          buttonLocation.top + this.getSubmenuOffsetY());
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


    // overridden
    _applyVisibility : function(value, old)
    {
      this.base(arguments, value, old);

      var mgr = qx.ui.menu.Manager.getInstance();

      if (value === "visible")
      {
        // Register to manager (zIndex handling etc.)
        mgr.add(this);

        // Mark opened in parent menu
        var opener = this.getOpener();
        var parentMenu = opener.getParentMenu && opener.getParentMenu();
        if (parentMenu) {
          parentMenu.setOpened(opener);
        }
      }
      else
      {
        // Deregister from manager (zIndex handling etc.)
        mgr.remove(this);

        // Unmark opened in parent menu
        var opener = this.getOpener();
        var parentMenu = opener.getParentMenu && opener.getParentMenu();
        if (parentMenu && parentMenu.getOpened() == opener) {
          parentMenu.resetOpened();
        }

        // Clear properties
        this.resetOpened();
        this.resetSelected();
      }
    },


    // property apply
    _applySelected : function(value, old)
    {
      //this.debug("SEL: " + value);

      if (old) {
        old.removeState("selected");
      }

      if (value) {
        value.addState("selected");
      }
    },


    // property apply
    _applyOpened : function(value, old)
    {
      this.debug("OPEN: " + value);

      if (old) {
        old.getMenu().exclude();
      }

      if (value) {
        value.getMenu().open();
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
      // Cache manager
      var mgr = qx.ui.menu.Manager.getInstance();

      // Be sure this menu is kept
      mgr.cancelClose(this);

      // Change selection
      var target = e.getTarget();
      if (target instanceof qx.ui.menu.Button)
      {
        this.setSelected(target);

        var subMenu = target.getMenu && target.getMenu();
        if (subMenu)
        {
          // Finally schedule for opening
          mgr.scheduleOpen(subMenu);

          // Remember scheduled menu for opening
          this._scheduledSubMenu = subMenu;
        }
        else
        {
          var opened = this.getOpened();
          if (opened) {
            mgr.scheduleClose(opened.getMenu());
          }

          if (this._scheduledSubMenu)
          {
            mgr.cancelOpen(this._scheduledSubMenu);
            this._scheduledSubMenu = null;
          }
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
      // Cache manager
      var mgr = qx.ui.menu.Manager.getInstance();

      // Detect whether the related target is out of the menu
      var relTarget = e.getRelatedTarget();
      if (!this._contains(relTarget))
      {
        var opened = this.getOpened();

        if (opened)
        {
          this.setSelected(opened);
          mgr.cancelClose(opened.getMenu());
        }
        else
        {
          this.resetSelected();
        }

        if (this._scheduledSubMenu) {
          mgr.cancelOpen(this._scheduledSubMenu);
        }
      }
    }
  }
});
