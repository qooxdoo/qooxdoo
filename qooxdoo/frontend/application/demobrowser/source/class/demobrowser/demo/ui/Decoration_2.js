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

qx.Class.define("demobrowser.demo.ui.Decoration_2",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var containerLayout = new qx.ui.layout.HBox();
      containerLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(containerLayout);

      this.getRoot().add(container, 0, 0);


      // Fill registry
      var mgr = qx.util.ImageRegistry.getInstance();
      var base = qx.core.Setting.get("demobrowser.resourceUri") + "/demobrowser/demo/grid_decoration/"

      mgr.register(base + "button-tl.png", base + "button-combined.png", 0, 0, 2, 2);
      mgr.register(base + "button-tr.png", base + "button-combined.png", 0, -2, 2, 2);
      mgr.register(base + "button-br.png", base + "button-combined.png", 0, -4, 2, 2);
      mgr.register(base + "button-bl.png", base + "button-combined.png", 0, -6, 2, 2);
      mgr.register(base + "button-t.png", base + "button-combined.png", 0, -8, 2, 2);
      mgr.register(base + "button-b.png", base + "button-combined.png", 0, -10, 2, 2);

      mgr.register(base + "button-l.png", base + "button-center-combined.png", 0, 0, 2, 16);
      mgr.register(base + "button-c.png", base + "button-center-combined.png", -2, 0, 2, 16);
      mgr.register(base + "button-r.png", base + "button-center-combined.png", -4, 0, 2, 16);


      // Examples
      var deco1 = new qx.ui.decoration.Grid(base + "button.png");
      var widget1 = new qx.ui.core.Widget;
      widget1.setWidth(200);
      widget1.setHeight(200);
      widget1.setDecorator(deco1);
      containerLayout.add(widget1);


      var layout = new qx.ui.layout.Grid();
      layout.add(new qx.ui.basic.Image(base2 + "button-tl.png"), 0, 0);
      layout.add(new qx.ui.basic.Image(base2 + "button-t.png"), 0, 1);
      layout.add(new qx.ui.basic.Image(base2 + "button-tr.png"), 0, 2);
      layout.add(new qx.ui.basic.Image(base2 + "button-l.png"), 1, 0);
      layout.add(new qx.ui.basic.Image(base2 + "button-c.png"), 1, 1);
      layout.add(new qx.ui.basic.Image(base2 + "button-r.png"), 1, 2);
      layout.add(new qx.ui.basic.Image(base2 + "button-bl.png"), 2, 0);
      layout.add(new qx.ui.basic.Image(base2 + "button-b.png"), 2, 1);
      layout.add(new qx.ui.basic.Image(base2 + "button-br.png"), 2, 2);

      containerLayout.add(new qx.ui.core.Widget().set({
        layout: layout
      }));
    }
  }
});
