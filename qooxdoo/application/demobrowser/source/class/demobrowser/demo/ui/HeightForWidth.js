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

qx.Class.define("demobrowser.demo.ui.HeightForWidth",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var vbox = new qx.ui.layout.VBox;
      vbox.setSpacing(20);

      var container = new qx.ui.container.Composite(vbox).set({
        decorator: "main",
        width: 300
      });
      this.getRoot().add(container, {left:20, top:20});

      var label1 = new qx.ui.basic.Label().set({
        decorator: "main",
        rich : true,
        content: "Screenshots #1 and #2 show that the label can be reduced in size to 102 pixels horizontally or to 55 pixels vertically, so long as there is enough space in the other direction. Screenshot #3 shows what happens when the label is squeezed down to its minimum height and minimum width."
      });
      container.add(label1);

      var label2 = new qx.ui.basic.Label().set({
        decorator: "main",
        rich : true,
        content: "We would like QLabel to tell the layout that screenshot #1 and screenshot #2 are acceptable but that screenshot #3 is not. The sizeHint() and minimumSizeHint() functions cannot do this, so Qt provides a complementary mechanism: height-for-width."
      });
      container.add(label2);

      var label3 = new qx.ui.basic.Label().set({
        decorator: "main",
        rich : true,
        content: "Every widget's QSizePolicy contains a boolean height-for-width flag that indicates whether or not the widget is able to trade width for height and height for width. The layout will call the virtual function QWidget::heightForWidth() as necessary to determine the desired height for a height-for-width widget with a given width."
      });

      container.add(label3);
    }
  }
});
