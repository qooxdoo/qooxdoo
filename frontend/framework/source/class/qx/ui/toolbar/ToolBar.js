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
     * Jonathan Rass (jonathan_rass)

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
 * @appearance toolbar
 */
qx.Class.define("qx.ui.toolbar.ToolBar",
{
  extend : qx.ui.core.Widget,




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

    // this.addEventListener("keypress", this._onKeyPress);
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

/*
    openMenu :
    {
      check : "qx.ui.menu.Menu",
      event : "changeOpenMenu",
      nullable : true
    },
*/


    /** Whether icons, labels, both or none should be shown. */
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
     * Add a item at the end of the toolbar
     *
     * @type member
     * @param item {qx.ui.core.Widget} widget to add
     * @param options {Map?null} Optional layout data for widget.
     */
    add: function(item, options) {
      this._add(item, options);
    },


    /**
     * Add a spacer at the current position to the toolbar. The spacer has a flex
     * value of one and will stretch to the available space.
     *
     * @return {qx.ui.core.Spacer} The newly added spacer object. A reference
     *   to the spacer is needed to remove ths spacer from the layout.
     */
    addSpacer: function()
    {
      var spacer = new qx.ui.core.Spacer;
      this._add(spacer, {flex:1});
      return spacer;
    },



    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Wraps key events to target functions
     *
     * @type member
     * @param e {qx.event.type.KeyInput} the key event object
     * @return {void}
     */
    _onKeyPress : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Left":
          return this._onKeyPressLeft();

        case "Right":
          return this._onKeyPressRight();
      }
    },


    /**
     * Event handler for the "left" key
     *
     * @type member
     * @return {void}
     */
    _onKeyPressLeft : function()
    {
      var menu = this.getOpenMenu();

      if (!menu) {
        return;
      }

      var opener = menu.getOpener();

      if (!opener) {
        return;
      }

      var children = this.getAllButtons();
      var length = children.length;
      var index = children.indexOf(opener);
      var current;
      var prevButton = null;

      for (var i=index-1; i>=0; i--)
      {
        current = children[i];

        if (current instanceof qx.ui.toolbar.MenuButton && current.getEnabled())
        {
          prevButton = current;
          break;
        }
      }

      // If none found, try again from the begin (looping)
      if (!prevButton)
      {
        for (var i=length-1; i>index; i--)
        {
          current = children[i];

          if (current instanceof qx.ui.toolbar.MenuButton && current.getEnabled())
          {
            prevButton = current;
            break;
          }
        }
      }

      if (prevButton)
      {
        // hide other menus
        qx.ui.menu.Manager.getInstance().update();

        // show previous menu
        prevButton._showMenu(true);
      }
    },


    /**
     * Event handler for the "right" key
     *
     * @type member
     * @return {void}
     */
    _onKeyPressRight : function()
    {
      var menu = this.getOpenMenu();

      if (!menu) {
        return;
      }

      var opener = menu.getOpener();

      if (!opener) {
        return;
      }

      var children = this.getAllButtons();
      var length = children.length;
      var index = children.indexOf(opener);
      var current;
      var nextButton = null;

      for (var i=index+1; i<length; i++)
      {
        current = children[i];

        if (current instanceof qx.ui.toolbar.MenuButton && current.getEnabled())
        {
          nextButton = current;
          break;
        }
      }

      // If none found, try again from the begin (looping)
      if (!nextButton)
      {
        for (var i=0; i<index; i++)
        {
          current = children[i];

          if (current instanceof qx.ui.toolbar.MenuButton && current.getEnabled())
          {
            nextButton = current;
            break;
          }
        }
      }

      if (nextButton)
      {
        // hide other menus
        qx.ui.menu.Manager.getInstance().update();

        // show next menu
        nextButton._showMenu(true);
      }
    }
  }
});
