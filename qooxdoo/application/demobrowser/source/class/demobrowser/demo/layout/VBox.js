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

qx.Class.define("demobrowser.demo.layout.VBox",
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
      root.add(this.getBox7());
    },


    getBox1 : function()
    {
      // auto size
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowY: false
      });

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));

      return container;
    },


    getBox2 : function()
    {
      // container wider, horizontal alignment
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
        decorator: "main",
        backgroundColor: "yellow",
        minWidth: 60,
        allowGrowY: false
      });

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth: 40, alignX:"left"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth: 40, alignX:"center"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth: 40, alignX:"right"}));

      return container;
    },


    getBox3 : function()
    {
      // container higher, vertical alignment = bottom
      var box = new qx.ui.layout.VBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        height: 300,
        allowGrowY: false
      });

      box.setSpacing(5);
      box.setAlignY("bottom");

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));

      return container;
    },


    getBox4 : function()
    {
      // container higher, vertical alignment = middle
      var box = new qx.ui.layout.VBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        height: 300,
        allowGrowY: false
      });

      box.setSpacing(5);
      box.setAlignY("middle");

      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));
      container.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"}));

      return container;
    },


    getBox5 : function()
    {
      // auto size + vertical margins
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowY: false
      });

      var w1 = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        marginBottom: 10
      });
      var w2 = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        marginBottom: 10,
        marginTop: 20
      });
      var w3 = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        marginBottom: 10
      });

      container.add(w1);
      container.add(w2);
      container.add(w3);

      return container;
    },


    getBox6 : function()
    {
      // manual height + vertical margins + alignment=bottom
      var box = new qx.ui.layout.VBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        height: 300,
        allowGrowY: false
      });

      box.setSpacing(5);
      box.setAlignY("bottom");

      var w1 = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        marginBottom: 10
      });
      var w2 = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        marginBottom: 10,
        marginTop: 20
      });
      var w3 = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        marginBottom: 10
      });

      container.add(w1);
      container.add(w2);
      container.add(w3);

      return container;
    },


    getBox7 : function()
    {
      // manual height + vertical margins + alignment=middle
      var box = new qx.ui.layout.VBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        height: 300,
        allowGrowY: false
      });

      box.setSpacing(5);
      box.setAlignY("middle");

      var w1 = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        marginBottom: 10
      });
      var w2 = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        marginBottom: 10,
        marginTop: 20
      });
      var w3 = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green",
        marginBottom: 10
      });
      container.add(w1);
      container.add(w2);
      container.add(w3);

      return container;
    }
  }
});
