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
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // different flex dimensions
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({height: 300, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), { flex : 1 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), { flex : 2 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), { flex : 3 });
      container.setLayout(box);
      this.getRoot().add(container, {left:10, top:10});




      // different flex dimensions + limits
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({height: 300, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight:30}), { flex : 1 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), { flex : 2 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight:100}), { flex : 3 });

      this.getRoot().add(container, {left:130, top:10});



      // different flex dimensions + rounding issues
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({height: 300, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      for (var i=0; i<25; i++) {
        container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", height:5}), { flex : 1 });
      }

      this.getRoot().add(container, {left:250, top:10});



      // container height > layout max height
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({height: 300, minHeight: 300, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 60}), { flex : 1 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 60}), { flex : 2 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 60}), { flex : 3 });

      this.getRoot().add(container, {left:370, top:10});


      // container height < layout min height
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({height: 150, minHeight : 0, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minHeight: 60}), { flex : 1 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minHeight: 60}), { flex : 2 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minHeight: 60}), { flex : 3 });

      this.getRoot().add(container, {left:490, top:10});



      // container height < layout min height, but minHeight = auto
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({height: 150, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minHeight: 60}), { flex : 1 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minHeight: 60}), { flex : 2 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minHeight: 60}), { flex : 3 });

      this.getRoot().add(container, {left:610, top:10});
    }
  }
});
