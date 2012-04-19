/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * The NumberField is a single-line number input field. It uses HTML5 input field type
 * "number".
 */
qx.Class.define("qx.ui.mobile.form.NumberField",
{
  extend : qx.ui.mobile.form.Input,
  include : [qx.ui.mobile.form.MValue],
  implement : [qx.ui.form.IStringForm],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {var?null} The value of the widget.
   */
  construct : function(value)
  {
    this.base(arguments);
    this.setValue("0");
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
      init : "numberField"
    },
    
    
    /**
     * The minimum text field value (may be negative). This value must be smaller
     * than {@link #minimum}.
     */
    minimum :
    {
      check : "Integer",
      init : 0,
      apply : "_onChangeMinimum"
    },


    /**
     * The maximum text field value (may be negative). This value must be larger
     * than {@link #maximum}.
     */
    maximum :
    {
      check : "Integer",
      init : 100,
      apply : "_onChangeMaximum"
    },


    /**
     * The amount to increment on each event.
     */
    step :
    {
      check : "Integer",
      init : 1,
      apply : "_onChangeStep"
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
    _getType : function()
    {
      return "number";
    },
    
    
    /**
     * Called when changed the property step.
     * Delegates value change on DOM element.
     */
    _onChangeStep : function(value,old) {
      this._setAttribute("step",value);
    },
    
    
    /**
     * Called when changed the property maximum.
     * Delegates value change on DOM element.
     */
    _onChangeMaximum : function(value,old) {
      this._setAttribute("max",value);
    },
    
    
    /**
     * Called when changed the property minimum.
     * Delegates value change on DOM element.
     */
    _onChangeMinimum : function(value,old) {
      this._setAttribute("min",value);
    }
  }
});
