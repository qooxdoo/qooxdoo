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
     * Gabriel Munteanu (gabios)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * The Radio button for mobile.
 * 
 * *Example*
 * 
 * <pre class='javascript'>
 *    var form = new qx.ui.mobile.form.Form();
 *    var radio1 = new qx.ui.mobile.form.RadioButton();
 *    var radio2 = new qx.ui.mobile.form.RadioButton();
 *    var radio3 = new qx.ui.mobile.form.RadioButton();
 *    var group = new qx.ui.form.RadioGroup(radio1, radio2, radio3);
      
 *    form.add(radio1, "Germany");
 *    form.add(radio2, "UK");
 *    form.add(radio3, "USA");
 *
 *    this.getRoot.add(new qx.ui.mobile.form.renderer.Single(form));
 * </pre>
 * 
 * 
 */
qx.Class.define("qx.ui.mobile.form.RadioButton",
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
      init : "radio"
    },
    
    /** The assigned qx.ui.form.RadioGroup which handles the switching between registered buttons */
    group :
    {
      check  : "qx.ui.form.RadioGroup",
      nullable : true,
      apply : "_applyGroup"
    }

  },
  
  members :
  {
    // overridden
    _getType : function()
    {
      return "radio";
    },
  
    /**
     * Sets the check property to the check attribute value of the CheckBox.
     */
    _syncValueProperty : function(e) {
      this.setValue(this.getValue());
    },   

    /** The assigned {@link qx.ui.form.RadioGroup} which handles the switching between registered buttons */
    _applyGroup : function(value, old)
    {
      if (old) {
        old.remove(this);
      }

      if (value) {
        value.add(this);
      }
    },
    
    // overridden
    _setValue : function(value) {
      this._setAttribute("checked", value);
    },
    
    // overridden
    _getValue : function() {
      return this._getAttribute("checked");
    }

  }
});
