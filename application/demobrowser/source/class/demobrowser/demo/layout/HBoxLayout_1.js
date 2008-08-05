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

qx.Class.define("demobrowser.demo.layout.HBoxLayout_1",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // auto size
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({
        decorator: "black",
        backgroundColor: "yellow"
      });

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));

      this.getRoot().add(container, {left:10, top:10});


      // container higher, vertical alignment
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({
        decorator: "black",
        backgroundColor: "yellow",
        minHeight: 60
      });

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 40, alignY:"top"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 40, alignY:"middle"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 40, alignY:"bottom"}));

      this.getRoot().add(container, {left:10, top:70});


      // container wider, horizontal alignment = right
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", width: 500});

      box.setSpacing(5);
      box.setAlignX("right");

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));

      this.getRoot().add(container, {left:10, top:140});


      // container wider, horizontal alignment = center
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", width: 500});

      box.setSpacing(5);
      box.setAlignX("center");

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));

      this.getRoot().add(container, {left:10, top:200});



      // auto size + horizontal margins
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({
        decorator: "black",
        backgroundColor: "yellow"}
      );

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginRight(10);
      w2.setMarginLeft(20);
      w2.setMarginRight(10);
      w3.setMarginRight(10);

      this.getRoot().add(container, {left:10, top:260});



      // manual width + horizontal margins + alignment=right
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", width: 500});

      box.setSpacing(5);
      box.setAlignX("right");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginRight(10);
      w2.setMarginLeft(20);
      w2.setMarginRight(10);
      w3.setMarginRight(10);

      this.getRoot().add(container, {left:10, top:320});



      // manual width + horizontal margins + alignment=center
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", width: 500});

      box.setSpacing(5);
      box.setAlignX("center");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginRight(10);
      w2.setMarginLeft(20);
      w2.setMarginRight(10);
      w3.setMarginRight(10);

      this.getRoot().add(container, {left:10, top:380});
    }
  }
});
