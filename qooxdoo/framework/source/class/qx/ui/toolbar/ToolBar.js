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
     * Martin Wittemann (martinwittemann)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The Toolbar class is the main part of the toolbar widget.
 *
 * It can handle added {@link Button}s, {@link CheckBox}es, {@link RadioButton}s
 * and {@link Separator}s in its {@link #add} method. The {@link #addSpacer} method
 * adds a spacer at the current toolbar position. This means that the widgets
 * added after the method call of {@link #addSpacer} are aligned to the right of
 * the toolbar.
 *
 * For more details on the documentation of the toolbar widget, take a look at the
 * documentation of the {@link qx.ui.toolbar}-Package.
 */
qx.Class.define("qx.ui.toolbar.ToolBar",
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

    // add needed layout
    this._setLayout(new qx.ui.layout.HBox());
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

    /** Holds the currently open menu (when the toolbar is used for menus) */
    openMenu :
    {
      check : "qx.ui.menu.Menu",
      event : "changeOpenMenu",
      nullable : true
    },

    /** Whether icons, labels, both or none should be shown. */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon" ],
      inheritable : true,
      event : "changeShow"
    },

    /** The spacing between every child of the toolbar */
    spacing :
    {
      nullable : true,
      check : "Integer",
      themeable : true,
      apply : "_applySpacing"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __allowMenuOpenHover : false,

    /**
     * Indicate if a menu could be opened on hover or not.
     *
     * @internal
     * @param value {Boolean} <code>true</code> if a menu could be opened,
     *    <code>false</code> otherwise.
     */
    _setAllowMenuOpenHover : function(value) {
      this.__allowMenuOpenHover = value
    },

    /**
     * Return if a menu could be opened on hover or not.
     *
     * @internal
     * @return {Boolean} <code>true</code> if a menu could be opened,
     *    <code>false</code> otherwise.
     */
    _isAllowMenuOpenHover : function () {
      return this.__allowMenuOpenHover;
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySpacing : function(value, old)
    {
      var layout = this._getLayout();
      value == null ? layout.resetSpacing() : layout.setSpacing(value);
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Add a spacer to the toolbar. The spacer has a flex
     * value of one and will stretch to the available space.
     *
     * @return {qx.ui.core.Spacer} The newly added spacer object. A reference
     *   to the spacer is needed to remove this spacer from the layout.
     */
    addSpacer : function()
    {
      var spacer = new qx.ui.core.Spacer;
      this._add(spacer, {flex:1});
      return spacer;
    },


    /**
     * Adds a separator to the toolbar.
     */
    addSeparator : function() {
      this.add(new qx.ui.toolbar.Separator);
    },


    /**
     * Returns all nested buttons which contains a menu to show. This is mainly
     * used for keyboard support.
     *
     * @return {Array} List of all menu buttons
     */
    getMenuButtons : function()
    {
      var children = this.getChildren();
      var buttons = [];
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child instanceof qx.ui.menubar.Button) {
          buttons.push(child);
        } else if (child instanceof qx.ui.toolbar.Part) {
          buttons.push.apply(buttons, child.getMenuButtons());
        }
      }

      return buttons;
    }
  }
});
