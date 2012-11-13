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
qx.Class.define("tutorial.view.Confirm",
{
  extend : qx.ui.window.Window,

  construct : function(desktopTutorials, mobileTutorials)
  {
    this.base(arguments, "Confirm");

    // configure window
    this.setModal(true);
    this.setShowMaximize(false);
    this.setShowMinimize(false);
    this.setShowClose(false);
    this.setMovable(false);
    this.setResizable(false);

    this.setLayout(new qx.ui.layout.Grid(10, 5));
    this.getLayout().setRowAlign(0, "center", "top");
    this.getLayout().setColumnWidth(0, 200);

    // message
    this.__meassage = new qx.ui.basic.Label();
    this.__meassage.setFont("bold");
    this.__meassage.set({
      rich: true,
      wrap: true
    });
    this.add(this.__meassage, {row: 0, column: 0, colSpan: 3});

    // ignore checkbox
    var ignoreBox = new qx.ui.form.CheckBox("Remember my answer");
    this.add(ignoreBox, {row: 1, column: 0});
    ignoreBox.bind("value", this, "ignore");

    // cancel button
    var cancelButton = new qx.ui.form.Button("Cancel");
    cancelButton.setWidth(80);
    this.add(cancelButton, {row: 1, column: 1});
    cancelButton.addListener("execute", function() {
      if (tutorial.Application.allowFade()) {
        this.fadeOut(300).on("end", function() {
          this.close();
          this.fireDataEvent("confirm", false);
        }, this);
      } else {
        this.close();
        this.fireDataEvent("confirm", false);
      }

    }, this);
    ignoreBox.bind("value", cancelButton, "enabled", {converter : function(data) {
      return !data;
    }});

    // ok button
    var okButton = new qx.ui.form.Button("Ok");
    okButton.setWidth(80);
    this.add(okButton, {row: 1, column: 2});
    okButton.addListener("execute", function() {
      if (tutorial.Application.allowFade()) {
        this.fadeOut(300).on("end", function() {
          this.close();
          this.fireDataEvent("confirm", true);
        }, this);
      } else {
        this.close();
        this.fireDataEvent("confirm", true);
      }

    }, this);
    okButton.addListener("appear", function() {
      okButton.focus();
    });

    this.center();
  },


  properties : {
    ignore : {
      check : "Boolean",
      event : "changeIgnore"
    }
  },


  events : {
    "confirm" : "qx.event.type.Data"
  },

  members :
  {
    __meassage : null,


    setMessage : function(text) {
      this.__meassage.setValue(text);
    }
  }
});