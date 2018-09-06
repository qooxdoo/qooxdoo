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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A Button widget which supports various states and allows it to be used
 * via the mouse, touch, pen and the keyboard.
 *
 * If the user presses the button by clicking on it, or the <code>Enter</code> or
 * <code>Space</code> keys, the button fires an {@link qx.ui.core.MExecutable#execute} event.
 *
 * If the {@link qx.ui.core.MExecutable#command} property is set, the
 * command is executed as well.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var button = new qx.ui.form.Button("Hello World");
 *
 *   button.addListener("execute", function(e) {
 *     alert("Button was clicked");
 *   }, this);
 *
 *   this.getRoot().add(button);
 * </pre>
 *
 * This example creates a button with the label "Hello World" and attaches an
 * event listener to the {@link #execute} event.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/button.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.form.Button",
{
  extend : qx.ui.basic.Atom,
  include : [qx.ui.core.MExecutable],
  implement : [qx.ui.form.IExecutable],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} label of the atom
   * @param icon {String?null} Icon URL of the atom
   * @param command {qx.ui.command.Command?null} Command instance to connect with
   */
  construct : function(label, icon, command)
  {
    this.base(arguments, label, icon);

    if (command != null) {
      this.setCommand(command);
    }

    // Add listeners
    this.addListener("pointerover", this._onPointerOver);
    this.addListener("pointerout", this._onPointerOut);
    this.addListener("pointerdown", this._onPointerDown);
    this.addListener("pointerup", this._onPointerUp);
    this.addListener("tap", this._onTap);

    this.addListener("keydown", this._onKeyDown);
    this.addListener("keyup", this._onKeyUp);

    // Stop events
    this.addListener("dblclick", function(e) {
      e.stopPropagation();
    });
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
      init : "button"
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates :
    {
      focused : true,
      hovered : true,
      pressed : true,
      disabled : true
    },


    /*
    ---------------------------------------------------------------------------
      USER API
    ---------------------------------------------------------------------------
    */

    /**
     * Manually press the button
     */
    press : function()
    {
      if (this.hasState("abandoned")) {
        return;
      }

      this.addState("pressed");
    },


    /**
     * Manually release the button
     */
    release : function()
    {
      if (this.hasState("pressed")) {
        this.removeState("pressed");
      }
    },


    /**
     * Completely reset the button (remove all states)
     */
    reset : function()
    {
      this.removeState("pressed");
      this.removeState("abandoned");
      this.removeState("hovered");
    },



    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Listener method for "pointerover" event
     * <ul>
     * <li>Adds state "hovered"</li>
     * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
     * </ul>
     *
     * @param e {qx.event.type.Pointer} Mouse event
     */
    _onPointerOver : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      if (this.hasState("abandoned"))
      {
        this.removeState("abandoned");
        this.addState("pressed");
      }

      this.addState("hovered");
    },


    /**
     * Listener method for "pointerout" event
     * <ul>
     * <li>Removes "hovered" state</li>
     * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state is set)</li>
     * </ul>
     *
     * @param e {qx.event.type.Pointer} Mouse event
     */
    _onPointerOut : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      this.removeState("hovered");

      if (this.hasState("pressed"))
      {
        this.removeState("pressed");
        this.addState("abandoned");
      }
    },


    /**
     * Listener method for "pointerdown" event
     * <ul>
     * <li>Removes "abandoned" state</li>
     * <li>Adds "pressed" state</li>
     * </ul>
     *
     * @param e {qx.event.type.Pointer} Mouse event
     */
    _onPointerDown : function(e)
    {
      if (!e.isLeftPressed()) {
        return;
      }

      e.stopPropagation();

      // Activate capturing if the button get a pointerout while
      // the button is pressed.
      this.capture();

      this.removeState("abandoned");
      this.addState("pressed");
    },


    /**
     * Listener method for "pointerup" event
     * <ul>
     * <li>Removes "pressed" state (if set)</li>
     * <li>Removes "abandoned" state (if set)</li>
     * <li>Adds "hovered" state (if "abandoned" state is not set)</li>
     *</ul>
     *
     * @param e {qx.event.type.Pointer} Mouse event
     */
    _onPointerUp : function(e)
    {
      this.releaseCapture();

      // We must remove the states before executing the command
      // because in cases were the window lost the focus while
      // executing we get the capture phase back (mouseout).
      var hasPressed = this.hasState("pressed");
      var hasAbandoned = this.hasState("abandoned");

      if (hasPressed) {
        this.removeState("pressed");
      }

      if (hasAbandoned) {
        this.removeState("abandoned");
      }

      e.stopPropagation();
    },


    /**
     * Listener method for "tap" event which stops the propagation.
     *
     * @param e {qx.event.type.Pointer} Pointer event
     */
    _onTap : function(e) {
      // "execute" is fired here so that the button can be dragged
      // without executing it (e.g. in a TabBar with overflow)
      this.execute();
      e.stopPropagation();
    },


    /**
     * Listener method for "keydown" event.<br/>
     * Removes "abandoned" and adds "pressed" state
     * for the keys "Enter" or "Space"
     *
     * @param e {Event} Key event
     */
    _onKeyDown : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Enter":
        case "Space":
          this.removeState("abandoned");
          this.addState("pressed");
          e.stopPropagation();
      }
    },


    /**
     * Listener method for "keyup" event.<br/>
     * Removes "abandoned" and "pressed" state (if "pressed" state is set)
     * for the keys "Enter" or "Space"
     *
     * @param e {Event} Key event
     */
    _onKeyUp : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Enter":
        case "Space":
          if (this.hasState("pressed"))
          {
            this.removeState("abandoned");
            this.removeState("pressed");
            this.execute();
            e.stopPropagation();
          }
      }
    }
  }
});
