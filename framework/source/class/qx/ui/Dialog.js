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

qx.Bootstrap.define("qx.ui.Dialog",
{
  type: "static",

  statics : {
    messageBox: function(options) {
      var title, message, icon;

      if (qx.lang.Type.isString(options)) {
        message = options;
        title = title || "Alert";
        icon = icon || "alert";

        (new qx.ui.dialog.Message(title, message, icon)).show();
      }
      else if (qx.lang.Type.isObject(options)) {
        (new qx.ui.dialog.Message(options['title'], options['message'], options['icon'])).show();
      }
    },

    alert: function (message) {
      (new qx.ui.dialog.Message("Alert", message, "alert")).show();
    },

    error: function(message) {
      (new qx.ui.dialog.Message("Error", message, "error")).show();
    },

    warning: function (message) {
      (new qx.ui.dialog.Message("Warning", message, "warning")).show();
    },

    /**
     * This method create and shown a confirm dialog.
     * @return {qx.ui.dialog.Confirm}
     */
    confirm: function(options) {
      var title, message, buttons, icon;

      if (qx.lang.Type.isString(options)) {
        message = options;
        title = "Confirm";
      }
      else if (qx.lang.Type.isObject(options)) {
        message = options['message'] || '';
        title = options['title'] || "Confirm";
        buttons = options['buttons'] || null;
        icon = options['icon'] || null;
      }
      else {
        throw new Error('Malformed arguments for confirm dialog.');
      }

      var dialog = new qx.ui.dialog.Confirm(title, message, buttons, icon);
      dialog.show();
      return dialog;
    }
  }
});
