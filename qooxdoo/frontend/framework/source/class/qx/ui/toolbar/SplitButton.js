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

qx.Class.define("qx.ui.toolbar.SplitButton",
{
  extend : qx.ui.core.Widget,
  include : qx.ui.core.MExecutable,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon, command, menu)
  {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.HBox);

    // Force arrow creation
    this._createChildControl("arrow");

    // Add mouse listeners
    this.addListener("mouseover", this._onMouseOver, this, true);
    this.addListener("mouseout", this._onMouseOut, this, true);

    // Process incoming arguments
    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    if (command != null) {
      this.setCommand(null);
    }

    if (menu != null) {
      this.setMenu(menu);
    }
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
      init : "toolbar-splitbutton"
    },


    /** The label/caption/text of the qx.ui.basic.Atom instance */
    label :
    {
      apply : "_applyLabel",
      nullable : true,
      dispose : true,
      check : "String"
    },


    /** Any URI String supported by qx.ui.basic.Image to display a icon */
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true,
      themeable : true
    },


    /**
     * Configure the visibility of the sub elements/widgets.
     * Possible values: both, text, icon
     */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon" ],
      themeable : true,
      nullable : true,
      inheritable : true,
      apply : "_applyShow",
      event : "changeShow"
    },


    /** The menu instance to show when clicking on the button */
    menu :
    {
      check : "qx.ui.menu.Menu",
      nullable : true,
      apply : "_applyMenu",
      event : "changeMenu"
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "button":
          control = new qx.ui.toolbar.Button;
          control.addListener("execute", this._onButtonExecute, this);
          this._addAt(control, 0);
          break;

        case "arrow":
          control = new qx.ui.toolbar.MenuButton;
          this._addAt(control, 1);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    _forwardStates : {
      hovered : 1
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyLabel : function(value, old)
    {
      var button = this._getChildControl("button");
      value == null ? button.resetLabel() : button.setLabel(value);
    },

    // property apply
    _applyIcon : function(value, old)
    {
      var button = this._getChildControl("button");
      value == null ? button.resetIcon() : button.setIcon(value);
    },

    // property apply
    _applyMenu : function(value, old)
    {
      var arrow = this._getChildControl("arrow");

      arrow.setEnabled(!!value);

      if (value)
      {
        arrow.setEnabled(true);
        arrow.setMenu(value);

        value.addListener("changeVisibility", this._onChangeMenuVisibility, this);
      }
      else
      {
        arrow.setEnabled(false);
        arrow.resetMenu();
      }

      if (old) {
        old.removeListener("changeVisibility", this._onChangeMenuVisibility, this);
      }
    },

    // property apply
    _applyShow : function(value, old) {
      // pass: is already inherited to the button
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Listener for <code>mouseover</code> event
     *
     * @param e {qx.event.type.Mouse} mouseover event
     */
    _onMouseOver : function(e)
    {
      // Captured listener
      // Whole stop for event, do not let the
      // inner buttons know about this event.
      e.stopPropagation();

      // Add hover state, is forwarded to the buttons
      this.addState("hovered");

      // Delete cursor out flag
      delete this._cursorIsOut;
    },


    /**
     * Listener for <code>mouseout</code> event
     *
     * @param e {qx.event.type.Mouse} mouseout event
     */
    _onMouseOut : function(e)
    {
      // Captured listener
      // Whole stop for event, do not let the
      // inner buttons know about this event.
      e.stopPropagation();

      // First simple state check
      if (!this.hasState("hovered")) {
        return;
      }

      // Only when the related target is not part of the button
      var related = e.getRelatedTarget();
      if (qx.ui.core.Widget.contains(this, related)) {
        return;
      }

      // When the menu is visible (cursor moved to the menu)
      // keep the hover state on the whole button
      var menu = this.getMenu();
      if (menu && menu.isVisible())
      {
        this._cursorIsOut = true;
        return;
      }

      // Finally remove state
      this.removeState("hovered");
    },


    /**
     * Event listener for button's execute event.
     *
     * @param e {qx.event.type.Event} execute event of the button
     */
    _onButtonExecute : function(e)
    {
      // forward execute event
      this.execute();
    },


    /**
     * Event listener for visibility changes of the menu
     *
     * @param e {qx.event.type.Data} property change event
     */
    _onChangeMenuVisibility : function(e)
    {
      if (!this.getMenu().isVisible() && this._cursorIsOut) {
        this.removeState("hovered");
      }
    }
  }
});
