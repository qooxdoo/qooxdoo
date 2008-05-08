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

qx.Class.define("demobrowser.demo.layout.DockLayout_1",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var containerLayout = new qx.ui.layout.VBox();
      containerLayout.setSpacing(20);

      var container = new qx.ui.container.Composite(containerLayout);
      this.getRoot().add(container, {left:20, top:20});



      // default layout, auto-sized
      var widget = new qx.ui.container.Composite(new qx.ui.layout.Dock()).set(
      {
        decorator: "black",
        backgroundColor: "yellow"
      });

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "red"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "orange"});
      var w4 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w5 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "fuchsia"});

      widget.add(w1, {edge:"north"});
      widget.add(w2, {edge:"west"});
      widget.add(w3, {edge:"south"});
      widget.add(w4, {edge:"east"});
      widget.add(w5, {edge:"center"});

      container.add(widget);




      // y-axis first, auto-sized
      var dock = new qx.ui.layout.Dock();
      dock.setSort("y");

      var widget = (new qx.ui.container.Composite(dock)).set(
      {
        decorator: "black",
        backgroundColor: "yellow"
      });

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "red"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "orange"});
      var w4 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w5 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "fuchsia"});

      widget.add(w1, {edge:"north"});
      widget.add(w2, {edge:"west"});
      widget.add(w3, {edge:"south"});
      widget.add(w4, {edge:"east"});
      widget.add(w5, {edge:"center"});

      container.add(widget);





      // x-axis first, auto-sized
      var dock = new qx.ui.layout.Dock();
      dock.setSort("x");

      var widget = (new qx.ui.container.Composite(dock)).set(
      {
        decorator: "black",
        backgroundColor: "yellow"
      });

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "red"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "orange"});
      var w4 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w5 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "fuchsia"});

      widget.add(w1, {edge:"north"});
      widget.add(w2, {edge:"west"});
      widget.add(w3, {edge:"south"});
      widget.add(w4, {edge:"east"});
      widget.add(w5, {edge:"center"});

      container.add(widget);
    }
  }
});
