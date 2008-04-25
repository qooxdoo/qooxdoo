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

qx.Class.define("demobrowser.demo.layout.HBoxLayout_4",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // different flex dimensions
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({width: 500, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), { flex : 1 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), { flex : 2 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), { flex : 3 });

      this.getRoot().add(container, {left:10, top:20});




      // different flex dimensions + limits
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({width: 500, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth:30}), { flex : 1 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), { flex : 2 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth:150}), { flex : 3 });

      this.getRoot().add(container, {left:10, top:80});



      // different flex dimensions + rounding issues
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({width: 500, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      for (var i=0; i<25; i++)
      {
        var widget = new qx.ui.core.Widget();
        widget.set({decorator: "black", backgroundColor: "green", width:5});
        container.add(widget, {flex: 1});
      }

      this.getRoot().add(container, {left:10, top:140});



      // container width > layout max width
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({width: 600, minWidth: 600, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth: 120}), { flex : 1 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth: 120}), { flex : 2 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth: 120}), { flex : 3 });

      this.getRoot().add(container, {left:10, top:200});


      // container width < layout min width
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({width: 300, minWidth : 0, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minWidth: 120}), { flex : 1 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minWidth: 120}), { flex : 2 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minWidth: 120}), { flex : 3 });

      this.getRoot().add(container, {left:10, top:260});



      // container width < layout min width, but minWidth = auto
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({width: 300, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minWidth: 120}), { flex : 1 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minWidth: 120}), { flex : 2 });
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", minWidth: 120}), { flex : 3 });

      this.getRoot().add(container, {left:10, top:320});
    }
  }
});
