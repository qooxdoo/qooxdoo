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

qx.Class.define("demobrowser.demo.widget.Label_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var decor = new qx.ui.decoration.Basic(1, "solid", "black");

      var label1 = new qx.ui.basic.Label("My Label").set({
        decorator: decor
      });
      this.getRoot().add(label1, 20, 20);
      
      var label2 = new qx.ui.basic.Label("My First Long Label").set({
        decorator: decor
      });
      this.getRoot().add(label2, 20, 60);

      var label3 = new qx.ui.basic.Label("My First Long Label").set({
        decorator: decor,
        width: 80
      });
      this.getRoot().add(label3, 20, 100);

      var label4 = new qx.ui.basic.Label().set({
        content: "A long label text with auto-wrapping. This also may contain <b style='color:red'>rich HTML</b> markup.",
        decorator: decor,
        rich : true,
        width: 120
      });
      this.getRoot().add(label4, 20, 140);

      this.debug("Height for Width (50): " + label4.getHeightForWidth(50));
      this.debug("Height for Width (100): " + label4.getHeightForWidth(100));
      this.debug("Height for Width (200): " + label4.getHeightForWidth(200));
    }
  }
});
