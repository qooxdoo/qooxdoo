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
 * This widget displays a dialog.
 *
 * *Example*
 *
 * <pre class='javascript'>
 * var label = new qx.ui.mobile.basic.Label("Hello World");
 * var dialog = new qx.ui.mobile.dialog.Dialog(label);
 * dialog.setTitle("Info");
 * dialog.setModal(true); // true by default
 * dialog.show();
 * </pre>
 *
 * This example creates a label widget and adds this widget to a dialog.
 *
 * @deprecated {3.0} Please use qx.ui.mobile.Popup instead and call function setModal(true).
 */
qx.Class.define("qx.ui.mobile.dialog.Dialog",
{
  extend : qx.ui.mobile.dialog.Popup,


  construct : function()
  {
    this.base(arguments);

    qx.log.Logger.deprecatedClassWarning(this.constructor, "Use qx.ui.mobile.dialog.Popup instead.");
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
      init : "dialog"
    }
  }
});
