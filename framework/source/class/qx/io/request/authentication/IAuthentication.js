/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * Interface of an authentication delegate.
 */
qx.Interface.define("qx.io.request.authentication.IAuthentication",
{

  members :
  {
    /**
     * Headers to include in request for authentication purposes.
     *
     * @return {Map[]} Array of maps. Each map represent a header and
     *          must have the properties <code>key</code> and <code>value</code>
     *         with a value of type string.
     */
    getAuthHeaders: function() {}
  }
});
