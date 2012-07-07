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
/* ************************************************************************

#require(qx.event.handler.Input)

************************************************************************ */

/**
 * The mixin contains all functionality to provide common properties for
 * text fields.
 */
qx.Mixin.define("qx.ui.mobile.form.MText",
{

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
    this.initMaxLength();
    this.initPlaceholder();
    this.initReadOnly();
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
   /**
     * Maximal number of characters that can be entered in the input field.
     */
    maxLength :
    {
      check : "PositiveInteger",
      nullable : true,
      init : null,
      apply : "_applyMaxLength"
    },


    /**
     * String value which will be shown as a hint if the field is all of:
     * unset, unfocused and enabled. Set to <code>null</code> to not show a placeholder
     * text.
     */
    placeholder :
    {
      check : "String",
      nullable : true,
      init : null,
      apply : "_applyAttribute"
    },


    /** Whether the field is read only */
    readOnly :
    {
      check : "Boolean",
      nullable : true,
      init : null,
      apply : "_applyAttribute"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    // property apply
    _applyMaxLength : function(value, old)
    {
      this._setAttribute("maxlength", value);
    }
  }
});
