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

qx.Class.define("demobrowser.demo.layout.GridLayout_5",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);
      this.getRoot().addMain(this.getGrid(), true);
    },


    getGrid : function()
    {
      var box = new qx.ui.container.Composite().set({
        decorator: "black",
        backgroundColor: "yellow"
      });

      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(5);

      // first column has fixed width
      layout.setColumnWidth(0, 250);

      // second and third have flex widths
      layout.setColumnFlex(1, 1);
      layout.setColumnFlex(2, 2);

      // last row stretches to available height
      layout.setRowFlex(2, 1);

      box.setLayout(layout);


      // first widget of first row has height of 100
      box.add(new qx.ui.core.Widget().set({
        decorator: "black",
        backgroundColor: "green",
        height: 100
      }), {row: 0, column: 0});

      box.add(new qx.ui.core.Widget().set({
        decorator: "black",
        backgroundColor: "green"
      }), {row: 0, column: 1});

      box.add(new qx.ui.core.Widget().set({
        decorator: "black", backgroundColor: "green"}), {row: 0, column: 2});


      // first widget of second row has height of 150
      box.add(new qx.ui.core.Widget().set({
        decorator: "black",
        backgroundColor: "green",
        height: 150
      }), {row: 1, column: 0});

      box.add(new qx.ui.core.Widget().set({
        decorator: "black",
        backgroundColor: "green"
      }), {row: 1, column: 1});

      box.add(new qx.ui.core.Widget().set({
        decorator: "black",
        backgroundColor: "green"
      }), {row: 1, column: 2});


      box.add(new qx.ui.core.Widget().set({
        decorator: "black",
        backgroundColor: "green"
      }), {row: 2, column: 0});

      box.add(new qx.ui.core.Widget().set({
        decorator: "black",
        backgroundColor: "green"
      }), {row: 2, column: 1});

      box.add(new qx.ui.core.Widget().set({
        decorator: "black",
        backgroundColor: "green"
      }), {row: 2, column: 2});

      return box;
    }
  }
});
