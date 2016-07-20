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

/**
 * This class provide a simple alert window.
 */
qx.Class.define('qx.ui.dialog.Message', {
  extend : qx.ui.dialog.Abstract,

  /**
   * @param caption {String?null} Title of dialog.
   * @param message {String} Message to show.
   * @param icon {String?null} Icon to use
   */
  construct : function(caption, message, icon) {
    caption = caption || "Message";
    icon = icon || "alert";

    this.base(arguments, caption, message, icon);
    this._createChildControl("ok");
  },

  statics : {
    DEFAULT_ICONS : {
      "alert" : "icon/48/status/dialog-information.png",
      "warning" : "icon/48/status/dialog-warning.png",
      "error" : "icon/48/status/dialog-error.png",
      "success" : "icon/48/actions/dialog-apply.png"
    }
  },

  members : {

    // overridden
    _createChildControlImpl : function(id) {
      var control;

      if(id == "ok") {
        control = new qx.ui.form.Button(this.tr('OK'));
        control.addListener('execute', function(e) {
          this.close();
        }, this);

        this.getChildControl("buttons-bar").add(control);
      }

      return control || this.base(arguments, id);
    },

    // property apply
    _applyCaptionBarChange : function(value, old, name) {
      if (name == "icon") {
        if (this.self(arguments).DEFAULT_ICONS[value]) {
          value = this.self(arguments).DEFAULT_ICONS[value];
        }

        this.getChildControl("atom").setIcon(value);
      }
      else {
        this.base(arguments, value, old, name);
      }
    }
  }
});
