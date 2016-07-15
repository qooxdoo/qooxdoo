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
    alert: function(message, title, icon) {
      title = title || "Alert";
      icon = icon || "alert";

      (new qx.ui.dialog.Message(title, message, icon)).show();
    },

    error: function(message, title, icon) {
      title = title || "Error";
      icon = icon || "error";

      (new qx.ui.dialog.Message(title, message, icon)).show();
    },

    warning: function (message, title, icon) {
      title = title || "Warning";
      icon = icon || "warning";

      (new qx.ui.dialog.Message(title, message, icon)).show();
    },

    confirm: function(message, buttons, title) {
      title = title || "Confirm";

      (new qx.ui.dialog.Confirm(title, message, buttons)).show();
    }
  }
});
