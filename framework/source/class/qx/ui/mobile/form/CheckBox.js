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
