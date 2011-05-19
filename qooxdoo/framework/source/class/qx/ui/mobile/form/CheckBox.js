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
 * The Checkbox is the mobile correspondent of the html checkbox.
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

    this.addListener('tap', this._syncValueProperty, this);
    this.addListener('swipe', this._syncValueProperty, this);
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
     * Sets the check property to the check attribute value of the CheckBox.
     */
    _syncValueProperty : function(e) {
      this.setValue(this.getValue());
    },
    
    _setValue : function(value) {
      this._setAttribute("checked", value);
    },
    
    _getValue : function() {
      return this._getAttribute("checked");
    }

  }
});
