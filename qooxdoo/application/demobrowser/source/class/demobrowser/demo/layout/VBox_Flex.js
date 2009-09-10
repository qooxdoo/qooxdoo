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

qx.Class.define("demobrowser.demo.layout.VBox_Flex",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scroll = new qx.ui.container.Scroll();
      this.getRoot().add(scroll, {edge: 0});

      var root = new qx.ui.container.Composite(new qx.ui.layout.HBox(20)).set({
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
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
        decorator: "main",
        backgroundColor: "yellow",
        height: 300,
        allowGrowY: false
      });

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), { flex : 1 });
      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), { flex : 2 });
      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), { flex : 3 });

      return container;
    },


    getBox2 : function()
    {
      // different flex dimensions + limits
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
        decorator: "main",
        backgroundColor: "yellow",
        height: 300,
        allowGrowY: false
      });

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        maxHeight:30
      }), { flex : 1 });
      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }), { flex : 2 });
      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        maxHeight:100
      }), { flex : 3 });

      return container;
    },


    getBox3 : function()
    {
      // different flex dimensions + rounding issues
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
        decorator: "main",
        backgroundColor: "yellow",
        height: 300,
        allowGrowY: false
      });

      for (var i=0; i<25; i++)
      {
        container.add(new qx.ui.core.Widget().set({
          decorator: "main",
          backgroundColor: "green",
          height:5}
        ), { flex : 1 });
      }

      return container;
    },


    getBox4 : function()
    {
      // container height > layout max height
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
        decorator: "main",
        backgroundColor: "yellow",
        height: 300,
        minHeight: 300,
        allowGrowY: false
      });

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        maxHeight: 60
      }), { flex : 1 });
      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        maxHeight: 60
      }), { flex : 2 });
      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        maxHeight: 60
      }), { flex : 3 });

      return container;
    },


    getBox5 : function()
    {
      // container height < layout min height
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
        height: 150,
        minHeight : 0,
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowY: false
      });

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        minHeight: 60
      }), { flex : 1 });
      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        minHeight: 60
      }), { flex : 2 });
      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        minHeight: 60
      }), { flex : 3 });

      return container;
    },


    getBox6 : function()
    {
      // container height < layout min height, but minHeight = auto
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
        height: 150,
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowY: false
      });

      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        minHeight: 60
      }), { flex : 1 });
      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        minHeight: 60
      }), { flex : 2 });
      container.add(new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        minHeight: 60
      }), { flex : 3 });

      return container;
    }
  }
});
