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

qx.Class.define("demobrowser.demo.root.Inline_Window",
{
  extend : qx.application.Inline,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var isle = new qx.ui.root.Inline(document.getElementById("isle")).set({
        decorator: "main",
        padding: 10,
        backgroundColor: "white"
      });
      isle.setLayout(new qx.ui.layout.HBox(10));

      var btnAddWin = new qx.ui.form.Button("Add window");
      var cWin = 1;
      btnAddWin.addListener("execute", function(e) {
        var win = new qx.ui.window.Window("Window #" + cWin++).set({
          width: 200,
          height: 150
        });
        win.moveTo(cWin*15, cWin*15);
        win.open();
      });
      isle.add(btnAddWin);

      var btnAddWinModal = new qx.ui.form.Button("Add modal window");
      btnAddWinModal.addListener("execute", this.newModalWindow, this);
      isle.add(btnAddWinModal);
    },

    cModWin : 1,

    newModalWindow : function()
    {
      var win = new qx.ui.window.Window("Modal Window #" + this.cModWin++).set({
        modal: true
      });
      win.moveTo(300 + this.cModWin*15, this.cModWin*15);
      win.setLayout(new qx.ui.layout.HBox());

      var btnAddWinModal = new qx.ui.form.Button("Add modal window");
      btnAddWinModal.addListener("execute", this.newModalWindow, this);
      win.add(btnAddWinModal);
      win.open();
    }
  }
});
