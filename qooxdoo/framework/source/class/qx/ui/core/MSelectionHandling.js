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
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * This mixin links all methods to manage the selection from the
 * internal selection manager to the widget.
 *
 * @deprecated Use 'qx.ui.core.MMultiSelectionHandling' instead!
 */
qx.Mixin.define("qx.ui.core.MSelectionHandling",
{
  include : qx.ui.core.MMultiSelectionHandling,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @deprecated Use 'qx.ui.core.MMultiSelectionHandling' instead!
   */
  construct : function()
  {
    qx.log.Logger.deprecatedMixinWarning(
      qx.ui.core.MSelectionHandling,
      "Use 'qx.ui.core.MMultiSelectionHandling' instead!"
    );
  }
});
