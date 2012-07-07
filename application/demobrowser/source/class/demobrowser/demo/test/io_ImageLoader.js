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

/**
 * @tag test
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.test.io_ImageLoader",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      qx.io.ImageLoader.load("http://resources.qooxdoo.org/images/logo.gif", function(source, data)
      {
        qx.log.Logger.debug("Image loaded (" + data.width + "x" + data.height + ")");

        var elem = document.createElement("img");
        elem.src = source;
        elem.width = Math.round(data.width * 1.5);
        elem.height = Math.round(data.height * 1.5);

        elem.style.position = "absolute";
        elem.style.left = "100px";
        elem.style.top = "100px";

        document.body.appendChild(elem);
      });
    }
  }
});
