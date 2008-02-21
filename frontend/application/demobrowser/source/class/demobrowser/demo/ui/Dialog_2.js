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
qx.Class.define("demobrowser.demo.ui.Dialog_2",
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
      doc.setPadding(20);

      var border = new qx.ui.decoration.Basic(1, "solid", "black");

      var dialog = new qx.ui.core.Widget().set({
         backgroundColor: "#EEE",
         decorator: border,
         padding: 10
      });
      doc.add(dialog);

      var layout = new qx.ui.layout.Grid();
      layout.setColumnFlex(0, 1);
      layout.setRowFlex(0, 1);
      layout.setSpacing(10);
      dialog.setLayout(layout);

      var pane = new qx.ui.core.Widget().set({
        backgroundColor : "#FFF",
        width: 600,
        decorator: border,
        padding: 10
      });

      pane.setLayout(this.getPaneLayout());

      layout.add(pane, 0, 0, { colSpan: 3});

      var btn_toggle = new qx.ui.basic.Label("Toggle first paragraph").set({
        backgroundColor : "#CCC",
        decorator: border,
        padding: [4, 8]
      });
      layout.add(btn_toggle, 1, 1);

      var growText = false;
      btn_toggle.addListener("click", function()
      {
        var label = pane.getLayout().getChildren()[0];
        label.setHtml(
          growText ?
            "qooxdoo is a comprehensive and innovative Ajax application framework. Leveraging object-oriented JavaScript allows developers to build impressive cross-browser applications. No HTML, CSS nor DOM knowledge is needed."
          :
            "<b>qooxdoo is cool.</b>"
        );
        growText = !growText;
      });

      var btn_resize = new qx.ui.basic.Label("Resize Pane").set({
        backgroundColor : "#CCC",
        decorator: border,
        padding: [4, 8]
      });
      layout.add(btn_resize, 1, 2);

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

    getPaneLayout : function()
    {
      var vbox = new qx.ui.layout.VBox;
      vbox.setSpacing(14);

      var label1 = new qx.ui.basic.Label();
      label1.setHtml("qooxdoo is a comprehensive and innovative Ajax application framework. Leveraging object-oriented JavaScript allows developers to build impressive cross-browser applications. No HTML, CSS nor DOM knowledge is needed.");
      vbox.add(label1);

      var label2 = new qx.ui.basic.Label();
      label2.setHtml("It includes a platform-independent development tool chain, a state-of-the-art GUI toolkit and an advanced client-server communication layer. It is Open Source under an LGPL/EPL dual license.");
      vbox.add(label2);

      var label3 = new qx.ui.basic.Label();
      label3.setHtml("qooxdoo (pronounced [’ku:ksdu:]) is a comprehensive and innovative Ajax application framework. Leveraging object-oriented JavaScript allows developers to build impressive cross-browser applications. No HTML, CSS nor DOM knowledge is needed. qooxdoo includes a platform-independent development tool chain, a state-of-the-art GUI toolkit and an advanced client-server communication layer. It is Open Source under an LGPL/EPL dual license.");
      vbox.add(label3);

      return vbox;
    }
  }
});
