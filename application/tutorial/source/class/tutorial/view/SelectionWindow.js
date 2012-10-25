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

    this.__buttonFont = new qx.bom.Font(12, ["Lucida Grande", "DejaVu Sans", "Verdana", "sans-serif"]);
    this.__buttonFont.set({
      color: "font",
      lineHeight: 1.3
    });

    // build the headlines
    var desktop = new qx.ui.basic.Label("Desktop");
    desktop.setFont("bold");
    this.add(desktop, {row: 0, column: 0});

    var title = "Mobile" + (this.__mobileSupported() ? "" : " (unsupported browser)");
    var mobile = new qx.ui.basic.Label(title);
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
    __mobileSupported : function() {
      var engine = qx.core.Environment.get("engine.name");
      return(engine == "webkit" || engine == "gecko");
    },

    __createButton : function(name, desc) {
      var button = new qx.ui.form.Button(
        name + "<br><span style='font-size: 11px; color: #777'>" + (desc || "&nbsp;") + "</span>"
      );
      button.set({
        rich: true,
        width: 200,
        font: this.__buttonFont,
        center: false
      });
      return button;
    },


    __buildSelection : function(desktopTutorials, mobileTutorials) {
      for (var i=0; i < desktopTutorials.length; i++) {
        var name = desktopTutorials[i].replace(/_/g, " ");
        var desc = qx.Class.getByName(
          "tutorial.tutorial.desktop." + desktopTutorials[i]
        ).description;
        var button = this.__createButton(name, desc);
        this.add(button, {row: i + 1, column: 0});
        button.addListener("execute", (function(name) {
          this.fireDataEvent("changeTutorial", {name: name, type: "desktop"});
          this.fadeOut(300).on("end", function() {
            this.close();
          }, this);
        }).bind(this, desktopTutorials[i]));
      };

      var supportsMobile = this.__mobileSupported();
      for (var i=0; i < mobileTutorials.length; i++) {
        var name = mobileTutorials[i].replace(/_/g, " ");
        var desc = qx.Class.getByName(
          "tutorial.tutorial.mobile." + mobileTutorials[i]
        ).description;
        var button = this.__createButton(name, desc);
        this.add(button, {row: i + 1, column: 1});
        if (supportsMobile) {
          button.addListener("execute", (function(name) {
            this.fireDataEvent("changeTutorial", {name: name, type: "mobile"});
            this.fadeOut(300).on("end", function() {
              this.close();
            }, this);
          }).bind(this, mobileTutorials[i]));
        } else {
          button.setEnabled(false);
          button.setToolTipText("Not supported on your browser.")
        }
      };
    }
  }
});