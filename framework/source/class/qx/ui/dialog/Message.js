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
 *
 * @asset(qx/icon/Oxygen/48/status/dialog-information.png)
 * @asset(qx/icon/Oxygen/48/status/dialog-warning.png)
 * @asset(qx/icon/Oxygen/48/status/dialog-error.png)
 * @asset(qx/icon/Oxygen/48/actions/dialog-apply.png)
 * @asset(qx/icon/${qx.icontheme}/48/status/dialog-information.png)
 * @asset(qx/icon/${qx.icontheme}/48/status/dialog-warning.png)
 * @asset(qx/icon/${qx.icontheme}/48/status/dialog-error.png)
 * @asset(qx/icon/${qx.icontheme}/48/actions/dialog-apply.png)
 * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)
 */
qx.Class.define('qx.ui.dialog.Message',
{
  extend : qx.ui.dialog.Abstract,

  /**
   * @param title {String?null} Title of dialog.
   * @param message {String} Message to show.
   * @param icon {String?null} Icon to use
   */
  construct : function(title, message, icon) {
    title = title || "Message";
    icon = icon || "alert";

    this.base(arguments, title, message);

    if (this.self(arguments).DEFAULT_ICONS[icon]) {
      this.setIcon(this.self(arguments).DEFAULT_ICONS[icon]);
    }
    else
    {
      this.setIcon(icon);
    }

    this._getButtonsBar().add(this.__getButton());
  },

  statics: {
    DEFAULT_ICONS :
    {
      "alert" : "icon/48/status/dialog-information.png",
      "warning" : "icon/48/status/dialog-warning.png",
      "error" : "icon/48/status/dialog-error.png",
      "success" : "icon/48/actions/dialog-apply.png"
    }
  },

  members : {
    __button: null,

    __getButton : function() {
      if(!this.__button)
      {
        this.__button = new qx.ui.form.Button(this.tr('OK'), 'icon/16/actions/dialog-ok.png');
        this.__button.addListener('execute', function(e) {
          this.close();
        }, this);
      }

      return this.__button;
    }
  }
});
