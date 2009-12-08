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
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * This class has been moved to {@link qx.part.Package}
 *
 * @deprecated This class has been moved to 'qx.part.Package'
 */
qx.Class.define("qx.io2.part.Package",
{
  extend : qx.part.Package,


  /**
   * @param urls {String[]} A list of script URLs
   * @param id {var} Unique package hash key
   * @param loaded {Boolean?false} Whether the package is already loaded
   * 
   * @deprecated Use 'qx.part.Package' instead.
   */
  construct : function(urls, id, loaded)
  {
    this.base(arguments, urls, id, loaded);
    qx.log.Logger.deprecatedClassWarning(
      qx.io2.part.Package,
      "This class has been moved to 'qx.part.Package'"
    );
  }
});
