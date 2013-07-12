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

    // Fix for Android 2.x: Re-call focus method on "touchstart" event.
    if (qx.core.Environment.get("os.name") == "android"
        && qx.core.Environment.get("os.version").charAt(0) == "2") {
      this.addListener("touchstart", this.focus);
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
      return "text";
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    if (qx.core.Environment.get("os.name") == "android"
        && qx.core.Environment.get("os.version").charAt(0) == "2") {
      this.removeListener("touchstart", this.focus);
    }
  }
});
