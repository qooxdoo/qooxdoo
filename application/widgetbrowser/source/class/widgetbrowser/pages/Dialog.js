/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 Yeshua Rodas, http://yybalam.net

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yeshua Rodas (yybalam)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * Demonstrates qx.ui.Dialog:
 *
 * Desktop, Window
 */

qx.Class.define("widgetbrowser.pages.Dialog", {
  extend: widgetbrowser.pages.AbstractPage,

  construct: function() {
    this.base(arguments);
    this.initWidgets();
  },

  members: {
      initWidgets: function() {
        // Buttons hor show dialog
        var btnAlert = new qx.ui.form.Button("Show Alert");
        var btnWarning = new qx.ui.form.Button("Show Warning");
        var btnError = new qx.ui.form.Button("Show Error");
        var btnConfirm = new qx.ui.form.Button("Show Confirm");
        var btnBlock = new qx.ui.form.Button("Show Block");
        var btnBusy = new qx.ui.form.Button("Show Busy");

        // Add button to document at fixed coordinates
        this.add(btnAlert, {left: 50, top: 50});
        this.add(btnWarning, {left: 50, top: 100});
        this.add(btnError, {left: 50, top: 150});
        this.add(btnConfirm, {left: 50, top: 200});
        this.add(btnBlock, {left: 50, top: 250});
        this.add(btnBusy, {left: 50, top: 300});

        // Add an event listener
      btnAlert.addListener("execute", function(e) {
        qx.ui.Dialog.alert(
          'This is an alert text demo.'
        );
      });

      btnWarning.addListener("execute", function(e) {
        qx.ui.Dialog.warning(
          'This is a warning text demo.'
        );
      });

      btnError.addListener("execute", function(e) {
        qx.ui.Dialog.error(
          'This is an error text demo.'
        );
      });

      btnConfirm.addListener("execute", function(e) {
        qx.ui.Dialog.confirm({
          caption: "Confirm Title",
          message: "What yo will to do cannot be undone.",
          buttons: [{
              button: "yes",
              callback: function() {
                qx.ui.Dialog.alert('This is an alert shown by confirm yes button.');
              }
            }, {
              button: "no",
              label: "¡No no!",
              callback: function() {
                qx.ui.Dialog.alert('Esto está en español. ;)');
              }
            }, {
              button: "cancel",
              callback: function() {
                qx.ui.Dialog.error('This error is shown by confirm cancel button.');
              }
            }
          ]
        }).setContext(this);
      });

      btnBlock.addListener("execute", function(e) {
        var win = new widgetbrowser.view.WindowBlockable();

        win.show();
        win.center();

        win.addListener('appear', function(){
          win.block();
        });

        qx.event.Timer.once(function() {
          win.unblock();
          win.close();
        }, this, 3000);
      });

      btnBusy.addListener("execute", function(e) {
        var win = new widgetbrowser.view.WindowBusy();
        win.show();
        win.center();

        win.addListener('appear', function(){
          win.block();
        });

        qx.event.Timer.once(function() {
          win.unblock();
          win.close();
        }, this, 3000);
      });
    }
  }
});
