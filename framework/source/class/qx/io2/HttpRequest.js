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
 * This class has been moved to {@link qx.io.HttpRequest}
 *
 * @deprecated This class has been moved to 'qx.io.HttpRequest'
 */
qx.Class.define("qx.io2.HttpRequest",
{
  extend : qx.io.HttpRequest,

  /**
   * @param url {String} URL to load
   * 
   * @deprecated Use 'qx.io.HttpRequest' instead.
   */
  construct : function(url)
  {
    this.base(arguments, url);
    qx.log.Logger.deprecatedClassWarning(
      qx.io2.HttpRequest,
      "This class has been moved to 'qx.io.HttpRequest'"
    );
  }
});