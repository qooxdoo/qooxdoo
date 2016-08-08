/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/*
 */

/**
 * @tag noPlayground
 * @lint environmentNonLiteralKey(key)
 *
 * @use(feature-checks)
 * @require(qx.lang.normalize.Object)
 */
qx.Class.define("demobrowser.demo.bom.Environment",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var output = new qx.util.StringBuilder();


      // SYNC CHECKS

      output.add("<h2>Synchronous checks</h2>");
      output.add("<table border='0'>");

      // this should not be used directly. Its just to show all added checks
      var checks = qx.core.Environment.getChecks();
      var keys = Object.keys(checks);
      keys.sort();

      var lastPrefix = "";
      for (var i = 0; i < keys.length; i++)
      {
        var key = keys[i];

        var prefix = key.split(".")[0];

        if (prefix != lastPrefix) {
          lastPrefix = prefix;
          output.add("<tr><td colspan='2'>&nbsp;</td></tr>");
          output.add("<tr><td colspan='2'><b>" + prefix + "</b></td></tr>");
        }

        var value = qx.core.Environment.get(key);
        if (key == "event.mousewheel") {
          // the 'target' property value is a Window object which cannot
          // be serialized due to circular references.
          value.target = value.target.toString();
        }
        output.add("<tr><td>", key, "</td><td>",
          qx.lang.Json.stringify(value, null, 2), "</td></tr>");
      }


      // ASYNC CHECKS

      output.add("<tr><td colspan='2'><h2>Asynchronous checks</h2></td></tr>");

      // this should not be used directly. Its just to show all added checks
      checks = qx.core.Environment.getAsyncChecks();
      var numberOfChecks = qx.lang.Object.getLength(checks);
      keys = Object.keys(checks);

      if (numberOfChecks)
      {
        for (var i = 0; i < keys.length; i++)
        {
          var key = keys[i];
          qx.core.Environment.getAsync(key, function(result) {
            output.add("<tr><td>", this, "</td><td>", qx.lang.Json.stringify(result, null, 2), "</td></tr>");
            numberOfChecks--;
            if (numberOfChecks === 0) {
              output.add("</table>");
              var isle = document.getElementById("output");
              isle.innerHTML = output.get();
            }
          }, key);
        }
      } else {
        output.add("</table>");
        var isle = document.getElementById("output");
        isle.innerHTML = output.get();
      }
    }
  }
});
