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

/* ************************************************************************

#asset(demobrowser/demo/icons/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.test.ImageLoader",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      function print(source, size) {
        this.debug("Image loaded: " + source + ": " + size.width + "x" + size.height);
      }

      var prefix = "../../resource/demobrowser/demo/icons/";

      qx.io2.ImageLoader.load(prefix + "feed-reader.png", print, this);
      qx.io2.ImageLoader.load(prefix + "multimedia-player.png", print, this);
      qx.io2.ImageLoader.load(prefix + "graphics-viewer-document.png", print, this);
    }
  }
});
