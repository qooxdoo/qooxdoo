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

/**
 * An implementation of a dialog layout using a grid.
 */
qx.Class.define("demobrowser.demo.ui.Label_Reflow",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);
      this.getRoot().setPadding(20);

      var layout = new qx.ui.layout.Grid();
      layout.setColumnFlex(0, 1);
      layout.setRowFlex(0, 1);
      layout.setSpacing(10);

      var dialog = new qx.ui.container.Composite(layout).set({
         backgroundColor: "#EEE",
         decorator: "main",
         padding: 10
      });
      this.getRoot().add(dialog);

      var pane = this.getPane();
      dialog.add(pane, {row: 0, column: 0, colSpan: 3});

      var btn_toggle = new qx.ui.basic.Label("Toggle first paragraph").set({
        backgroundColor : "#CCC",
        decorator: "main",
        padding: [4, 8]
      });
      dialog.add(btn_toggle, {row: 1, column: 1});

      var growText = false;
      btn_toggle.addListener("click", function()
      {
        var label = pane.getChildren()[0];
        label.setContent(
          growText ?
            "qooxdoo is a comprehensive and innovative Ajax application framework. Leveraging object-oriented JavaScript allows developers to build impressive cross-browser applications. No HTML, CSS nor DOM knowledge is needed."
          :
            "<b>qooxdoo is cool.</b>"
        );
        growText = !growText;
      });

      var btn_resize = new qx.ui.basic.Label("Resize Pane").set({
        backgroundColor : "#CCC",
        decorator: "main",
        padding: [4, 8]
      });
      dialog.add(btn_resize, {row: 1, column: 2});

      var growPane = false;
      btn_resize.addListener("click", function(e)
      {
        if (growPane) {
          pane.setWidth(600);
        } else {
          pane.setWidth(300);
        }
        growPane = !growPane;
      });
    },

    getPane : function()
    {
      var pane = new qx.ui.container.Composite(new qx.ui.layout.VBox(14)).set({
        backgroundColor : "#FFF",
        width: 600,
        decorator: "main",
        padding: 10
      });

      var label1 = new qx.ui.basic.Label().set({
        rich: true,
        content: "qooxdoo is a comprehensive and innovative Ajax application framework. Leveraging object-oriented JavaScript allows developers to build impressive cross-browser applications. No HTML, CSS nor DOM knowledge is needed."
      });
      pane.add(label1);

      var label2 = new qx.ui.basic.Label().set({
        rich: true,
        content: "It includes a platform-independent development tool chain, a state-of-the-art GUI toolkit and an advanced client-server communication layer. It is Open Source under an LGPL/EPL dual license."
      });
      pane.add(label2);

      var label3 = new qx.ui.basic.Label().set({
        rich: true,
        content: "qooxdoo (pronounced [’ku:ksdu:]) is a comprehensive and innovative Ajax application framework. Leveraging object-oriented JavaScript allows developers to build impressive cross-browser applications. No HTML, CSS nor DOM knowledge is needed. qooxdoo includes a platform-independent development tool chain, a state-of-the-art GUI toolkit and an advanced client-server communication layer. It is Open Source under an LGPL/EPL dual license."
      });
      pane.add(label3);

      return pane;
    }
  }
});
