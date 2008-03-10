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

qx.Class.define("demobrowser.demo.layout.VBoxLayout_4",
{
  extend : qx.application.Standalone,
  include : [demobrowser.MDemoApplication],

  members :
  {
    main: function()
    {
      this.base(arguments);

      // Call demo mixin init
      this.initDemo();

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);


      // different flex dimensions
      var box1 = (new qx.ui.core.Widget).set({height: 300, decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), { flex : 1 });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), { flex : 2 });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), { flex : 3 });
      box1.setLayout(layout1);
      doc.add(box1, 10, 10);




      // different flex dimensions + limits
      var box2 = (new qx.ui.core.Widget).set({height: 300, decorator: "black", backgroundColor: "yellow"});
      var layout2 = new qx.ui.layout.VBox();

      layout2.setSpacing(5);

      layout2.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight:30}), { flex : 1 });
      layout2.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), { flex : 2 });
      layout2.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight:100}), { flex : 3 });
      box2.setLayout(layout2);
      doc.add(box2, 130, 10);


      // different flex dimensions + rounding issues
      var box2 = (new qx.ui.core.Widget).set({height: 300, decorator: "black", backgroundColor: "yellow"});
      var layout2 = new qx.ui.layout.VBox();

      layout2.setSpacing(5);

      for (var i=0; i<25; i++) {
        layout2.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", height:5}), { flex : 1 });
      }

      box2.setLayout(layout2);
      doc.add(box2, 250, 10);



      // container height > layout max height
      var box1 = (new qx.ui.core.Widget).set({height: 300, minHeight: 300, decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 60}), { flex : 1 });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 60}), { flex : 2 });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 60}), { flex : 3 });
      box1.setLayout(layout1);
      doc.add(box1, 370, 10);


      // container height < layout min height
      var box1 = (new qx.ui.core.Widget).set({height: 150, minHeight : 0, decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minHeight: 60}), { flex : 1 });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minHeight: 60}), { flex : 2 });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minHeight: 60}), { flex : 3 });
      box1.setLayout(layout1);
      doc.add(box1, 490, 10);



      // container height < layout min height, but minHeight = auto
      var box1 = (new qx.ui.core.Widget).set({height: 150, decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minHeight: 60}), { flex : 1 });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minHeight: 60}), { flex : 2 });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minHeight: 60}), { flex : 3 });
      box1.setLayout(layout1);
      doc.add(box1, 610, 10);
    }
  }
});
