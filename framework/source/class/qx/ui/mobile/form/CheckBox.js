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
 * The Checkbox is the mobile correspondent of the html checkbox.
 *
 * *Example*
 *
 * <pre class='javascript'>
 *   var checkBox = new qx.ui.mobile.form.CheckBox();
 *   var title = new qx.ui.mobile.form.Title("Title");
 *
 *   checkBox.setModel("Title Activated");
 *   checkBox.bind("model", title, "value");
 *
 *   checkBox.addListener("changeValue", function(evt){
 *     this.setModel(evt.getdata() ? "Title Activated" : "Title Deactivated");
 *   });
 *
 *   this.getRoot.add(checkBox);
 *   this.getRoot.add(title);
 * </pre>
 *
 * This example adds 2 widgets , a checkBox and a Title and binds them together by their model and value properties.
 * When the user taps on the checkbox, its model changes and it is reflected in the Title's value.
 *
 */
qx.Class.define("qx.ui.mobile.form.CheckBox",
{
  extend : qx.ui.mobile.form.Input,
  include : [qx.ui.mobile.form.MValue],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {Boolean?null} The value of the checkbox.
   */
  construct : function(value)
  {
    this.base(arguments);
    qx.event.Registration.addListener(this, "appear", this.__onAppear, this);
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
      init : "checkBox"
    }

  },

  members :
  {
    __lastChangedTimestamp : 0,
    
    
    // overridden
    _getType : function()
    {
      return "checkbox";
    },


    /**
     * Event handler, when CheckBox appears on screen.
     */
    __onAppear : function() {
      var label = qx.dom.Element.create("label");
      qx.bom.element.Attribute.set(label, "for", this.getId());
      qx.bom.element.Class.add(label, "checkbox-label");

      qx.dom.Element.insertAfter(label, this.getContentElement());

      qx.event.Registration.removeListener(this, "appear", this.__onAppear, this);
    },


    /**
     * Sets the value [true/false] of this checkbox.
     * It is called by setValue method of qx.ui.mobile.form.MValue mixin
     * @param value {Boolean} the new value of the checkbox
     */
    _setValue : function(value) {
      this._setAttribute("checked", value);
    },

    /**
     * Gets the value [true/false] of this checkbox.
     * It is called by getValue method of qx.ui.mobile.form.MValue mixin
     * @return value {Boolean} the value of the checkbox
     */
    _getValue : function() {
      return this._getAttribute("checked");
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
       * that is why qooxdoo emulates a native event. Native and qooxdoo click event prevents checkbox
       * from changing its state. (1. CLICK >> ON - 2. CLICK >> OFF).
       * Check if a click event was recently fired.
       */ 
      if(!this._checkLastChangedTime()) {
        evt.stopPropagation();
        evt.preventDefault();
      }
    }
  },


  /*
  *****************************************************************************
      DESTRUCTOR
  *****************************************************************************
  */
  destruct : function()
  {
      qx.event.Registration.removeListener(this, "appear", this.__onAppear, this);
  }
});
