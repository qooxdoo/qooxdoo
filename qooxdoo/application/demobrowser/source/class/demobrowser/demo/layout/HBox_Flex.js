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

qx.Class.define("demobrowser.demo.layout.HBox_Flex",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scroll = new qx.ui.container.Scroll();
      this.getRoot().add(scroll, {edge: 0});

      var root = new qx.ui.container.Composite(new qx.ui.layout.VBox(20)).set({
        padding: 20
      })
      scroll.add(root);


      root.add(this.getBox1());
      root.add(this.getBox2());
      root.add(this.getBox3());
      root.add(this.getBox4());
      root.add(this.getBox5());
      root.add(this.getBox6());
    },


    getBox1 : function()
    {
      // different flex dimensions
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        width: 500,
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      box.setSpacing(5);

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}), { flex : 1 });
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}), { flex : 2 });
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}), { flex : 3 });

      return container;
    },


    getBox2 : function()
    {
      // different flex dimensions + limits
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        width: 500,
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      box.setSpacing(5);

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth:30}), { flex : 1 });
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}), { flex : 2 });
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth:150}), { flex : 3 });

      return container;
    },


    getBox3 : function()
    {
      // different flex dimensions + rounding issues
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        width: 500,
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      box.setSpacing(5);

      for (var i=0; i<25; i++)
      {
        var widget = new qx.ui.core.Widget();
        widget.set({decorator: "main", backgroundColor: "green", width:5});
        container.add(widget, {flex: 1});
      }

      return container;
    },


    getBox4 : function()
    {
      // container width > layout max width
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        width: 600,
        minWidth: 600,
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      box.setSpacing(5);

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth: 120}), { flex : 1 });
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth: 120}), { flex : 2 });
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth: 120}), { flex : 3 });

      return container;
    },


    getBox5 : function()
    {
      // container width < layout min width
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        width: 300,
        minWidth : 0,
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      box.setSpacing(5);

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", minWidth: 120}), { flex : 1 });
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", minWidth: 120}), { flex : 2 });
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", minWidth: 120}), { flex : 3 });

      return container;
    },


    getBox6 : function()
    {
      // container width < layout min width, but minWidth = auto
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        width: 300,
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      box.setSpacing(5);

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", minWidth: 120}), { flex : 1 });
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", minWidth: 120}), { flex : 2 });
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", minWidth: 120}), { flex : 3 });

      return container;
    }
  }
});
