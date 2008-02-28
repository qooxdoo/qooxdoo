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
     * Martin Wittemann (martinwittemann) 

************************************************************************ */

/**
 * A toggle Button widget
 *
 * If the user presses the button by clicking on ito pressing the enter or
 * space key, the button toggles beweteen the pressed an not pressed states. 
 * There is no execute event, only a {@link qx.ui.form.ToggleButton#changeChecked} event.
 *
 * @appearance button
 * @state abandoned
 * @state over
 * @state pressed
 */
qx.Class.define("qx.ui.form.ToggleButton",
{
  extend : qx.ui.basic.Atom,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * Creates a new instance of a ToggleButton.
   * @param label {String} The text on the button.
   * @param iconUrl {String} An URI to the icon of the button.
   */
  construct : function(label, iconUrl) {
    this.base(arguments, label, iconUrl);

    this.initTabIndex();
    // register mouse events
    this.addListener("mouseover", this._onmouseover);
    this.addListener("mouseout", this._onmouseout);
    this.addListener("mousedown", this._onmousedown);
    this.addListener("mouseup", this._onmouseup);
    // register keyboard events
    this.addListener("keydown", this._onkeydown);
    this.addListener("keyup", this._onkeyup);
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    appearance: {
      refine: true,
      init: "button"
    },

    tabIndex: {
      refine: true,
      init: 1
    },

    /** Boolean value signals if the button is checked */
    checked: {
      check: "Boolean",
      init: false,
      apply: "_applyChecked",
      event: "changeChecked"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Changes the state of the button dependent on the checked value.
     * 
     * @type member
     * @param value {Boolean} Current value
     * @param old {Boolean} Previous value
     */
    _applyChecked : function(value, old) {
      value ? this.addState("pressed") : this.removeState("pressed");
    },


    /**
     * Listener method for "mouseover" event.
     * <ul>
     * <li>Adds state "over"</li>
     * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
     * </ul>
     *
     * @type member
     * @param e {Event} Mouse event
     * @return {void}
     */
    _onmouseover : function(e) {
      if (!e.isTargetInsideWidget(this)) {
        return;
      }
      this.addState("over");
      if (this.hasState("abandoned")) {
        this.removeState("abandoned");
        this.addState("pressed");
      }
    },


    /**
     * Listener method for "mouseout" event.
     * <ul>
     * <li>Removes "over" state</li>
     * <li>Adds "abandoned" state (if "pressed" state is set)</li>
     * <li>Removes "pressed" state (if "pressed" state is set and button is not checked)
     * </ul>
     *
     * @type member
     * @param e {Event} Mouse event
     * @return {void}
     */
    _onmouseout : function(e) {
      if (!e.isTargetInsideWidget(this)) {
        return;
      }
      this.removeState("over");
      if (this.hasState("pressed")) {
        if (!this.getChecked()) {
          this.removeState("pressed");
        }
        this.addState("abandoned");
      }
    },
    
    
    /**
     * Listener method for "mousedown" event.
     * <ul>
     * <li>Activates capturing</li>
     * <li>Removes "abandoned" state</li>
     * <li>Adds "pressed" state</li>
     * </ul>
     *
     * @type member
     * @param e {Event} Mouse event
     * @return {void}
     */
    _onmousedown : function(e)
    {
      if (!e.isLeftPressed()) {
        return;
      }
      // Activate capturing if the button get a mouseout while
      // the button is pressed.
      this.capture();

      this.removeState("abandoned");
      this.addState("pressed");
    },


    /**
     * Listener method for "mouseup" event.
     * <ul>
     * <li>Releases capturing</li>
     * <li>Removes "pressed" state (if not "abandoned" state is set and "pressed" state is set)</li>
     * <li>Removes "abandoned" state (if set)</li>
     * <li>Toggles {@link #checked} (if state "abandoned" is not set and state "pressed" is set)</li>
     * </ul>
     *
     * @type member
     * @param e {Event} Mouse event
     * @return {void}
     */
    _onmouseup : function(e) {

      this.releaseCapture();

      var hasPressed = this.hasState("pressed");
      var hasAbandoned = this.hasState("abandoned");

      if (!hasAbandoned && hasPressed) {
        this.removeState("pressed");
      }

      if (hasAbandoned) {  
        this.removeState("abandoned");
      }
      
      if (!hasAbandoned && hasPressed) {
        this.toggleChecked();
      }
    },


    /**
     * Listener method for "keydown" event.<br/>
     * Removes "abandoned" and adds "pressed" state
     * for the keys "Enter" or "Space"
     *
     * @type member
     * @param e {Event} Key event
     * @return {void}
     */
    _onkeydown : function(e)
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
     * for the keys "Enter" or "Space". It also toggles the {@link #checked} property.
     *
     * @type member
     * @param e {Event} Key event
     * @return {void}
     */
    _onkeyup : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Enter":
        case "Space":
          if (this.hasState("pressed")) {
            
            this.removeState("abandoned");
            this.toggleChecked();
            
             e.stopPropagation();
          }
      }
    }
  }
});