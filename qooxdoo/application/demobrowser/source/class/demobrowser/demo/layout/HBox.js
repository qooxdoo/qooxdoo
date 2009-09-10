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

qx.Class.define("demobrowser.demo.layout.HBox",
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
      root.add(this.getBox7());
    },


    getBox1 : function()
    {
      // auto size
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));

      return container;
    },


    getBox2 : function()
    {
      // container higher, vertical alignment
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({
        decorator: "main",
        backgroundColor: "yellow",
        minHeight: 60,
        allowGrowX: false
      });

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxHeight: 40, alignY:"top"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxHeight: 40, alignY:"middle"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxHeight: 40, alignY:"bottom"}));

      return container;
    },


    getBox3 : function()
    {
      // container wider, horizontal alignment = right
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        width: 500,
        allowGrowX: false
      });

      box.setSpacing(5);
      box.setAlignX("right");

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));

      return container;
    },


    getBox4 : function()
    {
      // container wider, horizontal alignment = center
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        width: 500,
        allowGrowX: false
      });

      box.setSpacing(5);
      box.setAlignX("center");

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));

      return container;
    },


    getBox5 : function()
    {
      // auto size + horizontal margins
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"})
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"})
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"})

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginRight(10);
      w2.setMarginLeft(20);
      w2.setMarginRight(10);
      w3.setMarginRight(10);

      return container;
    },


    getBox6 : function()
    {
      // manual width + horizontal margins + alignment=right
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        width: 500,
        allowGrowX: false
      });

      box.setSpacing(5);
      box.setAlignX("right");

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"})
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"})
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"})

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginRight(10);
      w2.setMarginLeft(20);
      w2.setMarginRight(10);
      w3.setMarginRight(10);

      return container;
    },


    getBox7 : function()
    {
      // manual width + horizontal margins + alignment=center
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        width: 500,
        allowGrowX: false
      });

      box.setSpacing(5);
      box.setAlignX("center");

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"})
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"})
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"})

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginRight(10);
      w2.setMarginLeft(20);
      w2.setMarginRight(10);
      w3.setMarginRight(10);

      return container;
    }
  }
});
