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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.ScrollIntoView",
{
  extend : qx.application.Native,

  statics :
  {
    test : function()
    {
      var ids = [ "z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8" ];

      for (var i=0, l=ids.length; i<l; i++)
      {
        var el = document.getElementById(ids[i]);
        qx.log.Logger.log("Width: " + ids[i] + ": offset=" + el.offsetWidth + ", scroll=" + el.scrollWidth + ", client=" + el.clientWidth);
        qx.log.Logger.log("Height: " + ids[i] + ": offset=" + el.offsetHeight + ", scroll=" + el.scrollHeight + ", client=" + el.clientHeight);
      }
    }
  }
});
