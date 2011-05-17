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

    this.addListener('tap', this._syncCheckProperty, this);
    this.addListener('swipe', this._syncCheckProperty, this);
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    type :
    {
      refine : true,
      init : "checkbox"
    },

    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "checkBox"
    },
    
    /**
     * Whether this checkbox is enabled or not
     */
    enable :
    {
      init: true,
      check : "Boolean",
      nullable: false,
      apply: "_applyEnable"
    },
    
    /**
     * Whether this checkbox is checked or not
     */
    checked :
    {
      init: false,
      check : "Boolean",
      nullable: true,
      apply: "_applyChecked"
    }
  },
  
  members :
  {
  
    /**
     * Sets the check property to the check attribute value of the CheckBox.
     */
    _syncCheckProperty : function() {
      this.setChecked(this._getAttribute('checked'));
    },

    /**
     * Sets the enable property to the new value
     * @param value {Boolean}, the new value of the checkbox
     * @param old {Boolean?}, the old value of the checkbox
     * 
     */
    _applyEnable : function(value,old)
    {
      if(value)
      {
        this._setAttribute("disabled",null)
      }
      else
      {
        this._setAttribute("disabled","disabled");
      }
    },
    
    /**
     * Sets the checked property to the new value
     * @param value {Boolean}, the new value of the checked property
     * @param old {Boolean?}, the old value of the checked property
     * 
     */
    _applyChecked : function(value,old)
    {
      if(value)
      {
        this._setAttribute("checked",value)
      }
      else
      {
        this._setAttribute("checked",null);
      }
    }
  }
});
