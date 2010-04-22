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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.Client",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var output = new qx.util.StringBuilder();
      output.add("<table border='0'>");

      var classes = [
        qx.bom.client.Engine,
        qx.bom.client.Browser,
        qx.bom.client.Version,
        qx.bom.client.System,
        qx.bom.client.Platform,
        qx.bom.client.Feature,
        qx.bom.client.Locale,
        qx.bom.client.Flash
      ];

      for (var i = 0; i < classes.length; i++)
      {
        output.add("<tr><td colspan='2'><b>", classes[i].classname, "</b></td></tr>");
        for (var key in classes[i])
        {
          if (/^[A-Z_0-9]+$/.test(key)) {
            output.add("<tr><td>", key, "</td><td>",
              new String(classes[i][key]).toString(), "</td></tr>");
          }
        }
        output.add("<tr><td colspan='2'>&nbsp;</td></tr>");
      }

      var multimedia = qx.bom.client.Multimedia;
      var plugins = [
        "quicktime",
        "wmv",
        "divx",
        "silverlight"
      ];

      output.add("<tr><td colspan='2'><b>", multimedia.classname, "</b></td></tr>");
      for (var i = 0; i < plugins.length; i++)
      {
        output.add("<tr><td>", plugins[i], "</td><td>",
              multimedia.has(plugins[i]), "</td></tr>");
      }
      output.add("</table>");

      var isle = document.getElementById("output");
      isle.innerHTML = output.get();
    }
  }
});