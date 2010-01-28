/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.NativeContextMenu",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      // disable globally
      //this.getRoot().setNativeContextMenu(false);

      var container = new qx.ui.container.Composite().set({
        padding: 20
      });
      this.getRoot().add(container);

      var layout = new qx.ui.layout.Grid(10, 10);
      container.setLayout(layout);


      // menu allowed
      container.add(new qx.ui.basic.Label("Native context menu allowed").set({
        font: "bold"}
      ), {row: 0, column: 0});

      container.add(new qx.ui.basic.Label("plain label").set({
        nativeContextMenu: true,
        selectable: true
      }), {row: 1, column: 0});

      container.add(new qx.ui.basic.Label("<b>rich</b> label").set({
        nativeContextMenu: true,
        selectable: true,
        rich: true
      }), {row: 2, column: 0});

      container.add(new qx.ui.form.TextField("text field").set({
        nativeContextMenu: true
      }), {row: 3, column: 0});


      // menu not allowed
      container.add(new qx.ui.basic.Label("No native context menu").set({
        font: "bold"}
      ), {row: 0, column: 1});

      container.add(new qx.ui.basic.Label("plain label").set({
        selectable: true
      }), {row: 1, column: 1});

      container.add(new qx.ui.basic.Label("<b>rich</b> label").set({
        rich: true,
        selectable: true
      }), {row: 2, column: 1});

      container.add(new qx.ui.form.TextField("text field"), {row: 3, column: 1});
    }
  }
});
