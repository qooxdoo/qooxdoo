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

qx.Class.define("demobrowser.demo.layout.VBox_Reversed",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // auto height + reversed
      var box = new qx.ui.layout.VBox();
      var container = new qx.ui.container.Composite(box).set({decorator: "main", backgroundColor: "yellow", width: 120});

      box.setSpacing(5);
      box.setReversed(true);

      var w1 = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "blue",
        maxHeight:60,
        alignY:"top"}
      );
      var w2 = new qx.ui.basic.Label("click to reverse").set({
        decorator: "main",
        rich: true,
        backgroundColor: "green",
        padding : 5,
        height: 60,
        maxHeight:60,
        alignY:"middle",
        allowGrowX: true,
        allowGrowY: true
      });
      var w3 = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "grey",
        maxHeight:60,
        alignY:"bottom"
      });

      container.add(w1);
      container.add(w2);
      container.add(w3);

      container.addListener("mousedown", function(e) {
        box.setReversed(!box.getReversed());
      });

      this.getRoot().add(container, {left:10, top:10});
    }
  }
});
