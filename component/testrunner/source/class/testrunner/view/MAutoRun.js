/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Checks for the presence of a parameter named "autorun" in the Testrunner URI
 * and sets the autoRun property accordingly.
 */
qx.Mixin.define("testrunner.view.MAutoRun", {

  construct : function()
  {
    var parsedUri = qx.util.Uri.parseUri(location.href, true);
    if (parsedUri.queryKey && parsedUri.queryKey.autorun) {
      this.setAutoRun(true);
    }
  },

  properties :
  {
    /** Automatically run the selected tests after loading */
    autoRun :
    {
      check :"Boolean",
      init : false
    }
  }
});