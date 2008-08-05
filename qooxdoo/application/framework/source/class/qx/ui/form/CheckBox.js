/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * A check box widget with an optional label.
 */
qx.Class.define("qx.ui.form.CheckBox",
{
  extend : qx.ui.form.ToggleButton,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String?null} An optional label for the ckeck box.
   */
  construct : function(label)
  {
    if (qx.core.Variant.isSet("qx.debug", "on")) {
      this.assertArgumentsCount(arguments, 0, 1);
    }

    this.base(arguments, label);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "checkbox"
    },

    // overridden
    allowGrowX :
    {
      refine : true,
      init : false
    }
  }
});
