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
 *   ],
 *   "some/icon.png");
 *
 *   confirm.show();
 * </pre>
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

    this.setContext(this);
    this._composeButtons(buttons);
  },

  properties : {
    context : {
      check : "Object",
      apply : "_applyContext"
    }
  },

  members : {
    _callbacks : null,

    // property apply
    _applyContext : function(value, old) {
      for (var i in this._callbacks) {
        this._callbacks[i]['context'] = value;
      }
    },

      /**
       * Internal listener attached to every button showed on dialog.
       * This methods check if is set some callback function for a button id,
       * then call it for those cases.
       *
       * @param e {qx.event.type.Event}
       */
    _buttonHandler : function(e) {
      var callback = this._callbacks[e.getTarget().getUserData('id')];

      if(callback) {
        callback['callback'].call(callback['context']);
      }

      this.close();
    },

    /**
     * Internal method for compose the buttons and place it at buttons bar.
     *
     * @param buttons {Array}
     */
    _composeButtons : function(buttons) {
      var button;

      for (var i in buttons) {
        if (qx.lang.Type.isString(buttons[i])) {
          button = this.getChildControl(buttons[i]);
        }
        else if(qx.lang.Type.isObject(buttons[i])) {
          options = buttons[i];
          button = this.getChildControl(options['button']);

          if(options['label']) {
            button.setLabel(options['label']);
          }

          if(options['icon']) {
            button.setIcon(options['icon']);
          }

          if(options['callback']) {
            var callbackContext = options['context'] || this.getContext();

            this._callbacks[options['button']] = {
              callback : options['callback'],
              context : callbackContext
            };
          }
        }
        else {
          throw new Error ('Malformed button option.');
        }
      }
    },

    // overridden
    _createChildControlImpl : function(id) {
      var control;

      switch (id) {
        case "ok":
          control = new qx.ui.form.Button(this.tr('OK'));
          break;
        case "yes":
          control = new qx.ui.form.Button(this.tr('Yes'));
          break;
        case "no":
          control = new qx.ui.form.Button(this.tr('No'));
          break;
        case "cancel":
          control = new qx.ui.form.Button(this.tr('Cancel'));
          break;
      }

      if(control) {
        control.setUserData('id', id);
        control.addListener("execute", this._buttonHandler, this);
        this.getChildControl("buttons-bar").add(control);

        return control;
      }

      return this.base(arguments, id);
    }
  }
});
