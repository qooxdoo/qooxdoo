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

qx.Class.define("demobrowser.demo.bom.Multimedia",
{
  extend : qx.application.Native,

  members :
  {
    main : function()
    {
      this.base(arguments);

      window.APPLICATION = this;

      var multimedia = qx.bom.client.Multimedia;

      var plugins = [ "quicktime", "wmv", "divx", "silverlight" ];
      var installed, el;
      for (var i=0, j=plugins.length; i<j; i++)
      {
        installed = multimedia.has(plugins[i]);
        el = document.getElementById(plugins[i]);

        el.innerHTML = installed ? "true" : "false";
        el.className = installed ? "true" : "false";
      }
    }
  }
});
