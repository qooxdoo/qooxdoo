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
qx.Class.define('qx.ui.dialog.Confirm',
{
  extend : qx.ui.dialog.Abstract,

  /**
   * @param title {String?null}
   * @param message {String?null}
   * @param buttons {Array?null}
   */
  construct : function(title, message, buttons) {
    this.base(arguments, title, message);
    buttons = buttons || ["ok", "cancel"];

    this._buttons = {};
    this._callbacks = {};

    this.setIcon('icon/48/status/dialog-warning.png');

    if (!qx.lang.Type.isArray(buttons))
    {
      throw new Error ('Unsupported param type. Buttons must be an array of strings or Maps.');
    }
    this._composeButtons(buttons);
  },

  properties : {
    context: {
      init: this,
      check: "Object"
    }
  },

  members : {
    _buttons: null,
    _callbacks: null,

    /**
     * @param buttons {Array}
     */
    _composeButtons : function(buttons)
    {
      for var(i in buttons)
      {
        var button;
        var buttonDeff = buttons[i];

        if (qx.lang.Type.isString(buttonDeff))
        {
          button = this._getButton(buttons[i]);

          button.addListener("execute", function(e) {
            this._buttonHandler(buttons[i]);
          }, this);
        }
        else if(qx.lang.Type.isObject(buttonDeff))
        {
          button = this._getButton(buttonDeff['button']);

          button.addListener("execute", function(e) {
            this._buttonHandler(buttonDeff['button']);
          }, this);

          if(buttonDeff['label']) {
            button.setLabel(buttonDeff['label']);
          }

          if(buttonDeff['icon']) {
            button.setIcon(buttonDeff['icon']);
          }

          if(buttonDeff['callback']) {
            this._callbacks[buttons[i]]['callback'] = buttonDeff['callback'];

            if(buttonDeff['context']) {
              this._callbacks[buttons[i]]['context'] = buttonDeff['context'];
            }
            else {
              this._callbacks[buttons[i]]['context'] = this.getContext();
            }
          }
        }
        else
        {
          throw new Error ('Malformed button option.');
        }

        this.add(button);
      }
    },

    /**
     * Internal factory method of buttons.
     * @return {qx.ui.form.Button}
     */
    _getButton: function(id) {
      if(this._buttons[id]) return this._buttons[id];

      switch (id) {
        case "ok":
          this._buttons[id] = new qx.ui.form.Button('OK', 'icon/16/actions/dialog-ok.png');
          break;
        case "yes":
            this._buttons[id] = new qx.ui.form.Button('Yes', 'icon/16/actions/dialog-apply.png');
            break;
        case "no":
          this._buttons[id] = new qx.ui.form.Button('No', 'icon/16/actions/process-stop.png');
          break;
        case "cancel":
          this._buttons[id] = new qx.ui.form.Button('Cancel', 'icon/16/actions/dialog-cancel.png');
          break;
        default:
          throw new Error('Unsupported «id» for button');
      }

      return this._buttons[id];
    },

    _buttonHandler: function(id) {
      var callbackMap = this._callbacks[id];

      if(callbackMap) {
        callbackMap['callback'].call(callbackMap['context']);
      }

      this.close();
    }
  }
});
