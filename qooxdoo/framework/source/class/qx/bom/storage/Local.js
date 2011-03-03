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
     * Tino Butz (tbtz)
     * Adrian Olaru (adrianolaru)

************************************************************************ */


/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 */
qx.Class.define("qx.bom.storage.Local",
{
  extend : qx.bom.storage.Abstract,
  type : "singleton",

  construct : function()
  {
    this.base(arguments, "local");
  },


  statics :
  {
    /**
     * Whether the feature is supported or not.
     * 
     * @return {Boolean}
     */
    isSupported : function()
    {
      try {
        return window.localStorage != null;
      } catch (exc) {
        // Firefox Bug: Local execution of window.sessionStorage throws error
        // see https://bugzilla.mozilla.org/show_bug.cgi?id=357323
        return false;
      }
    }
  }


});
