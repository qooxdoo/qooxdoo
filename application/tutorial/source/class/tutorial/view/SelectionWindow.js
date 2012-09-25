/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
qx.Class.define("tutorial.view.SelectionWindow", 
{
  extend : qx.ui.window.Window,


  construct : function(desktopTutorials, mobileTutorials)
  {
    this.base(arguments, "Select Tutorial");

    // configure window
    this.setModal(true);
    this.setShowMaximize(false);
    this.setShowMinimize(false);
    this.setMovable(false);
    this.setResizable(false);

    this.setLayout(new qx.ui.layout.Grid(10, 5));
    this.getLayout().setRowAlign(0, "center", "top");

    // build the headlines
    var desktop = new qx.ui.basic.Label("Desktop");
    desktop.setFont("bold");
    this.add(desktop, {row: 0, column: 0});

    var mobile = new qx.ui.basic.Label("Mobile");
    mobile.setFont("bold");
    this.add(mobile, {row: 0, column: 1});

    this.__buildSelection(desktopTutorials, mobileTutorials);

    this.center();
  },

  events : {
    "changeTutorial" : "qx.event.type.Data"
  },

  members :
  {
    __buildSelection : function(desktopTutorials, mobileTutorials) {
      for (var i=0; i < desktopTutorials.length; i++) {
        var name = desktopTutorials[i].replace(/_/g, " ");
        var button = new qx.ui.form.Button(name);
        button.setWidth(200);
        this.add(button, {row: i + 1, column: 0});
        button.addListener("execute", (function(name) {
          this.fireDataEvent("changeTutorial", {name: name, type: "desktop"});
          this.fadeOut(300).on("end", function() {
            this.close();
          }, this);
        }).bind(this, desktopTutorials[i]));
      };

      for (var i=0; i < mobileTutorials.length; i++) {
        var name = mobileTutorials[i].replace(/_/g, " ");
        var button = new qx.ui.form.Button(name);
        button.setWidth(200);
        this.add(button, {row: i + 1, column: 1});
        button.addListener("execute", (function(name) {
          this.fireDataEvent("changeTutorial", {name: name, type: "mobile"});
          this.fadeOut(300).on("end", function() {
            this.close();
          }, this);
        }).bind(this, mobileTutorials[i]));
      };
    }
  }
});