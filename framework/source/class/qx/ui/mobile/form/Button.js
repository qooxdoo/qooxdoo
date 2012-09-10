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
 * A Button widget.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var button = new qx.ui.mobile.form.Button("Hello World");
 *
 *   button.addListener("tap", function(e) {
 *     alert("Button was clicked");
 *   }, this);
 *
 *   this.getRoot.add(button);
 * </pre>
 *
 * This example creates a button with the label "Hello World" and attaches an
 * event listener to the {@link qx.ui.mobile.core.Widget#tap} event.
 */
qx.Class.define("qx.ui.mobile.form.Button",
{
  extend : qx.ui.mobile.basic.Atom,
  
  
   /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function(label, icon)
  {
    this.base(arguments, label, icon);
    qx.event.Registration.addListener(this, "click", this.__onClick, this);
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
      init : "button"
    },

    // overridden
    activatable :
    {
      refine :true,
      init : true
    }
  },

  members :
  {
    __lastChangedTimestamp : 0,
    
    
    /**
     * Sets the value.
     *
     * @param value {String} The value to set
     */
    setValue : function(value) {
      this.setLabel(value);
    },


    /**
     * Returns the set value.
     *
     * @return {String} The set value
     */
    getValue : function() {
      return this.getLabel();
    },
    
    
     /**
     * Checks if last  event (click) is more than 500ms ago.
     * Bugfix for double fired events.
     */
    _checkLastChangedTime : function() {
      var elapsedTime = new Date().getTime() - this.__lastChangedTimestamp; 
      this.__lastChangedTimestamp = new Date().getTime();
      return elapsedTime>500;
    },
    
    
    /**
     * Handles the click event of this checkbox.
     * @param evt {Event} the click event.
     */
    __onClick : function(evt) {
      /**
       * Workaround for Android newer than version 4.0. JellyBean and later is 
       * able to fire a native click event. Other version or platforms might be not able:
       * that is why qooxdoo emulates a native event. 
       * Check if a click event was recently fired.
       */ 
      if(!this._checkLastChangedTime()) {
        evt.stopPropagation();
        evt.preventDefault();
      }
    }
  }
});
