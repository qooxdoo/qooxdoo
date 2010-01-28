/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * This class has been moved to {@link qx.io.part.Part}
 *
 * @deprecated This class has been moved to 'qx.io.part.Part'
 */
qx.Class.define("qx.io2.part.Part",
{
  extend : qx.io.part.Part,

  /**
   * @param name {String} Name of the part as defined in the config file at
   *    compile time.
   * @param packages {Package[]} List of dependent packages
   *
   * @deprecated Use 'qx.io.part.Part' instead.
   */
  construct : function(name, packages)
  {
    this.base(arguments, name, packages);

    qx.log.Logger.deprecatedClassWarning(
      qx.io2.part.Part,
      "This class has been moved to 'qx.io.part.Part'"
    );
  }
});