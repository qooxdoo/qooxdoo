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
 * Identical to DockLayout 1 but adds demonstration for spacings and margins.
 */
qx.Class.define("demobrowser.demo.layout.Dock_Margin",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scroll = new qx.ui.container.Scroll();
      this.getRoot().add(scroll, {edge: 0});

      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(20)).set({
        padding: 20
      })
      scroll.add(container);

      // default layout, auto-sized
      var widget = new qx.ui.container.Composite(new qx.ui.layout.Dock(3, 10)).set(
      {
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX : false
      });

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "red"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "blue", marginLeft : 20 });
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "orange", marginTop : 20});
      var w4 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxHeight:20, alignY : "bottom"});
      var w5 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "fuchsia"});

      widget.add(w1, {edge:"north"});
      widget.add(w2, {edge:"west"});
      widget.add(w3, {edge:"south"});
      widget.add(w4, {edge:"east"});
      widget.add(w5, {edge:"center"});

      container.add(widget);




      // y-axis first, auto-sized
      var dock = new qx.ui.layout.Dock(3, 10);
      dock.setSort("y");

      var widget = (new qx.ui.container.Composite(dock)).set(
      {
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX : false
      });

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "red"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "blue", marginLeft : 20 });
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "orange", marginTop : 20});
      var w4 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxHeight:20, alignY : "bottom"});
      var w5 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "fuchsia"});

      widget.add(w1, {edge:"north"});
      widget.add(w2, {edge:"west"});
      widget.add(w3, {edge:"south"});
      widget.add(w4, {edge:"east"});
      widget.add(w5, {edge:"center"});

      container.add(widget);





      // x-axis first, auto-sized
      var dock = new qx.ui.layout.Dock(3, 10);
      dock.setSort("x");

      var widget = (new qx.ui.container.Composite(dock)).set(
      {
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX : false
      });

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "red"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "blue", marginLeft : 20 });
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "orange", marginTop : 20});
      var w4 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxHeight:20, alignY : "bottom"});
      var w5 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "fuchsia"});

      widget.add(w1, {edge:"north"});
      widget.add(w2, {edge:"west"});
      widget.add(w3, {edge:"south"});
      widget.add(w4, {edge:"east"});
      widget.add(w5, {edge:"center"});

      container.add(widget);
    }
  }
});
