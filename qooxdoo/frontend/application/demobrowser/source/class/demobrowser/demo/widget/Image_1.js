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

qx.Class.define("demobrowser.demo.widget.Image_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);

      var container = new qx.ui.container.Composite(layout);
      container.setPadding(20);
      this.getRoot().add(container, {left:0,top:0});

      var base = "demobrowser/demo/icons/"
      container.add(new qx.ui.basic.Image(base + "feed-reader.png"));
      container.add(new qx.ui.basic.Image(base + "graphics-viewer-document.png"));
      container.add(new qx.ui.basic.Image(base + "format-justify-fill.png"));
      container.add(new qx.ui.basic.Image(base + "format-justify-left.png"));
      container.add(new qx.ui.basic.Image(base + "format-justify-right.png"));
      container.add(new qx.ui.basic.Image(base + "multimedia-player.png"));

      // toggle button
      var enable = false;
      var btn = new qx.ui.form.Button("Toggle enabled");
      btn.addListener("execute", function()
      {
        container.setEnabled(enable);
        enable = !enable;
      });

      this.getRoot().add(btn, {left:10, top:140});
    }
  }
});
