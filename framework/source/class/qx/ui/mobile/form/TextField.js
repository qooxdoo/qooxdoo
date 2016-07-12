/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * The TextField is a single-line text input field.
 */
qx.Class.define("qx.ui.mobile.form.TextField",
{
  extend : qx.ui.mobile.form.Input,
  include : [qx.ui.mobile.form.MValue, qx.ui.mobile.form.MText],
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

    this.addListener("keypress", this._onKeyPress, this);

    if (qx.core.Environment.get("os.name") == "ios") {
      // IOS does not blur input fields automatically if a parent DOM element
      // was set invisible, so blur manually on disappear
      this.addListener("disappear", this.blur, this);
    }
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
      init : "text-field"
    }
  },


  members :
  {
    // overridden
    _getType : function()
    {
      return "text";
    },


    /**
    * Event handler for <code>keypress</code> event.
    * @param evt {qx.event.type.KeySequence} the keypress event.
    */
    _onKeyPress : function(evt) {
      // On return
      if(evt.getKeyCode() == 13) {
        this.blur();
      }
    }
  },


  destruct : function() {
    this.removeListener("keypress", this._onKeyPress, this);

    if (qx.core.Environment.get("os.name") == "ios") {
      this.removeListener("disappear", this.blur, this);
    }
  }
});
