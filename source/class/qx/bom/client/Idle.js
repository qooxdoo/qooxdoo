/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 GONICUS GmbH, Germany, http://www.gonicus.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Cajus Pollmeier (cajus)

************************************************************************ */

/**
 * Responsible for checking whether the browser supports cooperative
 * scheduling.
 *
 * Spec: https://www.w3.org/TR/requestidlecallback/
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Idle",
{
  statics :
  {
    /**
     * Whether the client supports cooperative scheduling of background tasks.
     *
     * @internal
     * @return {Boolean} <code>true</code> if API is supported
     */
    getSupport : function() {
      return window.requestIdleCallback !== undefined;
    }
  },

  defer : function(statics) {
    qx.core.Environment.add("client.idle", statics.getSupport);
  }
});
