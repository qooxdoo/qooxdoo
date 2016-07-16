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
 * Display a Confirm Dialog
 *
 * Is possible a complete configuration of button's handlers, icon and labels
 *
 * *Example*
 *
 * <pre class='javascript'>
 *   var confirm = new qx.ui.dialog.Confirm("A title", "A message", [
 *     "ok",
 *     { button: "yes", label: "Fine", callback : function() {}, context: this},
 *     { button: "cancel", label : "No Thanks", icon "some/icon.png"}
 *   ]);
 *
 *   confirm.show();
 * </pre>
*
* @asset(qx/icon/Oxygen/48/status/dialog-warning.png)
* @asset(qx/icon/Oxygen/16/actions/dialog-apply.png)
* @asset(qx/icon/Oxygen/16/actions/process-stop.png)
* @asset(qx/icon/${qx.icontheme}/48/status/dialog-warning.png)
* @asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)
* @asset(qx/icon/${qx.icontheme}/16/actions/dialog-cancel.png)
* @asset(qx/icon/${qx.icontheme}/16/actions/dialog-apply.png)
* @asset(qx/icon/${qx.icontheme}/16/actions/process-stop.png)
*/
qx.Class.define('qx.ui.dialog.Confirm', {
  extend : qx.ui.dialog.Abstract,

  /**
   * @param title {String?null} Title of confirm dialog.
   * @param message {String?null} Message to show.
   * @param buttons {Array?null} Array of buttons configuration. `["ok", "cancel"]` by default.
   * @param icon {String?null} Icon to use.
   */
  construct : function(title, message, buttons, icon) {
    buttons = buttons || ["ok", "cancel"];
    icon = icon || "icon/48/status/dialog-warning.png";

    this.base(arguments, title, message, icon);

    this._buttons = {};
    this._callbacks = {};

    if (!qx.lang.Type.isArray(buttons)) {
      throw new Error ('Unsupported param type. Buttons must be an array of strings or Maps.');
    }

    this._composeButtons(buttons);
  },

  properties : {
    context : {
      init : this,
      check : "Object",
      apply : "_applyContext"
    }
  },

  members : {
    _buttons : null,
    _callbacks : null,

    _applyContext : function(value, old) {
      for (var i in this._callbacks) {
        this._callbacks[i]['context'] = value;
      }
    },

    _buttonHandler : function(e) {
      var callback = this._callbacks[e.getTarget().getUserData('id')];

      if(callback) {
        callback['callback'].call(callback['context']);
      }

      this.close();
    },

    /**
     * @param buttons {Array}
     */
    _composeButtons : function(buttons) {
      var button;
      var buttonDeff;

      for (var i in buttons) {
        buttonDeff = buttons[i];

        if (qx.lang.Type.isString(buttonDeff)) {
          button = this._getButton(buttonDeff);
        }
        else if(qx.lang.Type.isObject(buttonDeff)) {
          var buttonId = buttonDeff['button'];
          button = this._getButton(buttonId);

          if(buttonDeff['label']) {
            button.setLabel(buttonDeff['label']);
          }

          if(buttonDeff['icon']) {
            button.setIcon(buttonDeff['icon']);
          }

          if(buttonDeff['callback']) {
            var callbackContext = buttonDeff['context'] || this.getContext();

            this._callbacks[buttonId] = {
              callback : buttonDeff['callback'],
              context : callbackContext
            };
          }
        }
        else {
          throw new Error ('Malformed button option.');
        }

        button.addListener("execute", this._buttonHandler, this);
        this._getButtonsBar().add(button);
      }
    },

    /**
     * Internal factory method of buttons.
     * @return {qx.ui.form.Button}
     */
    _getButton: function(id) {
      if(this._buttons[id]) {
        return this._buttons[id];
      }

      switch (id) {
        case "ok":
          this._buttons[id] = new qx.ui.form.Button(this.tr('OK'), 'icon/16/actions/dialog-ok.png');
          break;
        case "yes":
            this._buttons[id] = new qx.ui.form.Button(this.tr('Yes'), 'icon/16/actions/dialog-apply.png');
            break;
        case "no":
          this._buttons[id] = new qx.ui.form.Button(this.tr('No'), 'icon/16/actions/process-stop.png');
          break;
        case "cancel":
          this._buttons[id] = new qx.ui.form.Button(this.tr('Cancel'), 'icon/16/actions/dialog-cancel.png');
          break;
        default:
          throw new Error('Unsupported «id» for button');
      }

      this._buttons[id].setUserData('id', id);
      return this._buttons[id];
    }
  }
});
