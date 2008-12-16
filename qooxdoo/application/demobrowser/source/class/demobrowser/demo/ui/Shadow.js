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

qx.Class.define("demobrowser.demo.ui.Shadow",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var shadow = new qx.ui.core.Widget().set({
        decorator: "shadow-window"
      });
      this.getRoot().add(shadow, {top: 10, left: 10});

      var shadow = new qx.ui.core.Widget().set({
        shadow: "shadow-window",
        decorator : "main",
        backgroundColor: "yellow"
      });
      this.getRoot().add(shadow, {top: 10, left: 150});
    }
  }
});
