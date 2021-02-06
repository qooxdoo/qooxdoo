/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * A button which acts as a normal button and shows a menu on one
 * of the sides to open something like a history list.
 *
 * @childControl button {qx.ui.form.Button} button to execute action
 * @childControl arrow {qx.ui.form.MenuButton} arrow to open the popup
 */
qx.Class.define("qx.ui.form.SplitButton",
{
  extend : qx.ui.core.Widget,
  include : [qx.ui.core.MExecutable],
  implement : [qx.ui.form.IExecutable],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Label to use
   * @param icon {String?null} Icon to use
   * @param menu {qx.ui.menu.Menu} Connect to menu instance
   * @param command {qx.ui.command.Command} Command instance to connect with
   */
  construct : function(label, icon, menu, command)
  {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.HBox);

    // Force arrow creation
    this._createChildControl("arrow");

    // Add pointer listeners
    this.addListener("pointerover", this._onPointerOver, this, true);
    this.addListener("pointerout", this._onPointerOut, this, true);

    // Add key listeners
    this.addListener("keydown", this._onKeyDown);
    this.addListener("keyup", this._onKeyUp);

    // Process incoming arguments
    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    if (menu != null) {
      this.setMenu(menu);
    }

    if (command != null) {
      this.setCommand(command);
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
      init : "splitbutton"
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    },


    /** The label/caption/text of the qx.ui.basic.Atom instance */
    label :
    {
      apply : "_applyLabel",
      nullable : true,
      check : "String"
    },


    /** Any URI String supported by qx.ui.basic.Image to display an icon */
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
      inheritable : true,
      apply : "_applyShow",
      event : "changeShow"
    },


    /** The menu instance to show when tapping on the button */
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
    __cursorIsOut : null,


    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "button":
          control = new qx.ui.form.Button;
          control.addListener("execute", this._onButtonExecute, this);
          control.setFocusable(false);
          this._addAt(control, 0, {flex: 1});
          break;

        case "arrow":
          control = new qx.ui.form.MenuButton();
          control.setFocusable(false);
          control.setShow("both");
          this._addAt(control, 1);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates :
    {
      hovered : 1,
      focused : 1
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyLabel : function(value, old)
    {
      var button = this.getChildControl("button");
      value == null ? button.resetLabel() : button.setLabel(value);
    },

    // property apply
    _applyIcon : function(value, old)
    {
      var button = this.getChildControl("button");
      value == null ? button.resetIcon() : button.setIcon(value);
    },

    // property apply
    _applyMenu : function(value, old)
    {
      var arrow = this.getChildControl("arrow");

      if (value)
      {
        arrow.resetEnabled();
        arrow.setMenu(value);
        value.setOpener(this);

        value.addListener("changeVisibility", this._onChangeMenuVisibility, this);
      }
      else
      {
        arrow.setEnabled(false);
        arrow.resetMenu();
      }

      if (old)
      {
        old.removeListener("changeVisibility", this._onChangeMenuVisibility, this);
        old.resetOpener();
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
     * Listener for <code>pointerover</code> event
     *
     * @param e {qx.event.type.Pointer} pointerover event
     */
    _onPointerOver : function(e)
    {
      // Captured listener
      // Whole stop for event, do not let the
      // inner buttons know about this event.
      e.stopPropagation();

      // Add hover state, is forwarded to the buttons
      this.addState("hovered");

      // Delete cursor out flag
      delete this.__cursorIsOut;
    },


    /**
     * Listener for <code>pointerout</code> event
     *
     * @param e {qx.event.type.Pointer} pointerout event
     */
    _onPointerOut : function(e)
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
        this.__cursorIsOut = true;
        return;
      }

      // Finally remove state
      this.removeState("hovered");
    },


    /**
     * Event listener for all keyboard events
     *
     * @param e {qx.event.type.KeySequence} Event object
     */
    _onKeyDown : function(e)
    {
      var button = this.getChildControl("button");
      switch(e.getKeyIdentifier())
      {
        case "Enter":
        case "Space":
          button.removeState("abandoned");
          button.addState("pressed");
      }
    },


    /**
     * Event listener for all keyboard events
     *
     * @param e {qx.event.type.KeySequence} Event object
     */
    _onKeyUp : function(e)
    {
      var button = this.getChildControl("button");
      switch(e.getKeyIdentifier())
      {
        case "Enter":
        case "Space":
          if (button.hasState("pressed"))
          {
            button.removeState("abandoned");
            button.removeState("pressed");
            button.execute();
          }
      }
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
      if (!this.getMenu().isVisible() && this.__cursorIsOut) {
        this.removeState("hovered");
      }
    }
  }
});
