/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

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
  implement : [qx.ui.form.IField],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {Boolean?false} The value of the checkbox.
   */
  construct : function(value)
  {
    this.base(arguments);

    if(typeof value != undefined) {
      this._state = value;
    }

    this.addListener("tap", this._onTap, this);
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
      init : "checkbox"
    }

  },

  members :
  {
    _state : null,


    // overridden
    _getTagName : function()
    {
      return "span";
    },


    // overridden
    _getType : function()
    {
      return null;
    },


    /**
     * Handler for tap events.
     */
    _onTap : function() {
      // Toggle State.
      this.setValue(!this.getValue());
    },


    /**
     * Sets the value [true/false] of this checkbox.
     * It is called by setValue method of qx.ui.mobile.form.MValue mixin
     * @param value {Boolean} the new value of the checkbox
     */
    _setValue : function(value) {
      if(value == true) {
        this.addCssClass("checked");
      } else {
        this.removeCssClass("checked");
      }

      this._setAttribute("checked", value);

      this._state = value;
    },


    /**
     * Gets the value [true/false] of this checkbox.
     * It is called by getValue method of qx.ui.mobile.form.MValue mixin
     * @return {Boolean} the value of the checkbox
     */
    _getValue : function() {
      return this._state;
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
  }
});
