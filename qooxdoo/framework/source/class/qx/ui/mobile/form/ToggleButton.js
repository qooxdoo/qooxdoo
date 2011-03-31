/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * A toggle Button widget
 *
 * If the user tap the button, the button toggles between the <code>ON</code>
 * and <code>OFF</code> state.
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var button = new qx.ui.mobile.form.ToggleButton(false);
 *
 *   button.addListener("changeValue", function(e) {
 *     alert(e.getData());
 *   }, this);
 *
 *   this.getRoot.add(button);
 * </pre>
 *
 * This example creates a toggle button and attaches an
 * event listener to the {@link #changeValue} event.
 */
qx.Class.define("qx.ui.mobile.form.ToggleButton",
{
  extend : qx.ui.mobile.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {Boolean?null} The value of the button
   */
  construct : function(value)
  {
    this.base(arguments);
    if (value) {
      this.setValue(value);
    }
    this.addListener("tap", this._onTap, this);
    this.addListener("swipe", this._onSwipe, this);
    // TODO: Add Child Control
    this.__child = this._createChild();
    this._add(this.__child);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "toggleButton"
    },


    /**
     * The value of the toggle button.
     */
    value :
    {
      check : "Boolean",
      init : false,
      apply : "_applyValue",
      event : "changeValue"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __child : null,


    /**
     * Returns the child control of the toggle button.
     *
     * @return {qx.ui.mobile.container.Composite} the child control.
     */
    _getChild : function() {
      return this.__child;
    },


    /**
     * Creates the child control of the widget. Needed to display the toggle
     * button.
     */
    _createChild : function() {
      return new qx.ui.mobile.container.Composite();
    },


    // property apply
    _applyValue : function(value, old)
    {
      if (value) {
        this._getChild().addCssClass("checked");
      } else {
        this._getChild().removeCssClass("checked");
      }
    },


    /**
     * Toggles the value of the button.
     */
    toggle : function() {
      this.setValue(!this.getValue());
    },


    /**
     * Event handler. Called when the tap event occurs.
     * Toggles the button.
     *
     * @param evt {qx.event.type.Tap} The tap event.
     */
    _onTap : function(evt)
    {
      this.toggle();
    },



    /**
     * Event handler. Called when the swipe event occurs.
     * Toggles the button.
     *
     * @param evt {qx.event.type.Swipe} The swipe event.
     */
    _onSwipe : function(evt)
    {
      this.toggle();
    }
  },




 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.removeListener("tap", this._onTap, this);
    this.removeListener("swipe", this._onSwipe, this);
    this.__child = null;
  }
});
