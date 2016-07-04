/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 by Tartan Solutions, Inc, http://www.tartansolutions.com

    License:
      LGPL: http://www.gnu.org/licenses/lgpl.html
      EPL: http://www.eclipse.org/org/documents/epl-v10.php
      See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Dan Hummon

************************************************************************ */

/**
 * A filtered table model to provide support for hiding and filtering table
 * rows. Any rows that match any applied filters will be hidden.
 * @deprecated {6.0} Use {@link qx.ui.table.model.Simple} instead !
 *
 */
qx.Class.define("qx.ui.table.model.Filtered", {
  extend : qx.ui.table.model.Simple,

  construct : function() {
    qx.log.Logger.deprecatedClassWarning(this, qx.lang.String.format(
      "use '%1' instead !",
      [this.constructor.superclass.classname]
    ));
    this.base(arguments);
  }
});
