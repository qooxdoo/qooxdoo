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

qx.Class.define("demobrowser.demo.ui.HBoxLayout_4",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      doc = new qx.ui.root.Application(document);

      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      var border = new qx.ui.decoration.Basic(1, "solid", "black");



      // different flex dimensions
      var box1 = (new qx.ui.core.Widget).set({width: 500, decorator: border, backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.HBox();

      layout1.setSpacing(5);

      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), { flex : 1 });
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), { flex : 2 });
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), { flex : 3 });
      box1.setLayout(layout1);
      doc.add(box1, 10, 70);




      // different flex dimensions + limits
      var box2 = (new qx.ui.core.Widget).set({width: 500, decorator: border, backgroundColor: "yellow"});
      var layout2 = new qx.ui.layout.HBox();

      layout2.setSpacing(5);

      layout2.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxWidth:30}), { flex : 1 });
      layout2.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"}), { flex : 2 });
      layout2.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxWidth:150}), { flex : 3 });
      box2.setLayout(layout2);
      doc.add(box2, 10, 130);


      // different flex dimensions + rounding issues
      var box2 = (new qx.ui.core.Widget).set({width: 500, decorator: border, backgroundColor: "yellow"});
      var layout2 = new qx.ui.layout.HBox();

      layout2.setSpacing(5);

      for (var i=0; i<25; i++)
      {
        var widget = new qx.ui.core.Widget();
        widget.set({decorator: border, backgroundColor: "green", width:5});
        layout2.add(widget, {flex: 1});
      }

      box2.setLayout(layout2);
      doc.add(box2, 10, 190);



      // container width > layout max width
      var box1 = (new qx.ui.core.Widget).set({width: 600, minWidth: 600, decorator: border, backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.HBox();

      layout1.setSpacing(5);

      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxWidth: 120}), { flex : 1 });
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxWidth: 120}), { flex : 2 });
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", maxWidth: 120}), { flex : 3 });
      box1.setLayout(layout1);
      doc.add(box1, 10, 250);


      // container width < layout min width
      var box1 = (new qx.ui.core.Widget).set({width: 300, minWidth : 0, decorator: border, backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.HBox();

      layout1.setSpacing(5);

      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", minWidth: 120}), { flex : 1 });
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", minWidth: 120}), { flex : 2 });
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", minWidth: 120}), { flex : 3 });
      box1.setLayout(layout1);
      doc.add(box1, 10, 310);



      // container width < layout min width, but minWidth = auto
      var box1 = (new qx.ui.core.Widget).set({width: 300, decorator: border, backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.HBox();

      layout1.setSpacing(5);

      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", minWidth: 120}), { flex : 1 });
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", minWidth: 120}), { flex : 2 });
      layout1.add((new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green", minWidth: 120}), { flex : 3 });
      box1.setLayout(layout1);
      doc.add(box1, 10, 370);
    }
  }
});
