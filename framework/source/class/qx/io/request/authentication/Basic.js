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
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * Basic authentication.
 */
qx.Class.define("qx.io.request.authentication.Basic",
{
  extend: qx.core.Object,
  implement: qx.io.request.authentication.IAuthentication,


  /**
   * @param username {var}
   *   Username to use
   *
   * @param password {var}
   *   Password to use
   */
  construct : function(username, password)
  {
     this.__credentials = qx.util.Base64.encode(username + ':' + password);
  },


  members :
  {
    __credentials : null,


    /**
     * Headers to include for basic authentication.
     *
     * @return {Map}
     *   Map containing the authentication credentials
     */
    getAuthHeaders: function()
    {
      return [
        {key: "Authorization", value: "Basic " + this.__credentials}
      ];
    }
  },


  destruct : function()
  {
    this.__credentials = null;
  }
});
