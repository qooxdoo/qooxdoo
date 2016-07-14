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
 *   var confirm = new qx.ui.dialog.Confirm("A title", "A message", {
 *     "context" : this,
 *     "ok" : function() {},
 *     "yes" : function() {}
 *   },
 *   {
 *     "icon" : "warning",
 *     "ok" : "Fine",
 *     "yes" : "Of course"
 *   });
 *
 *   confirm.show();
 * </pre>
 *
 *   var dialog = new qx.ui.dialog.Confirm('title', 'message', {
 *     ok: function() { [something]; },
 *     context: me
 *   });
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
   * @param buttons {String?null}
   * @param handlers {Map?null}
   */
  construct : function(title, message, buttons, handlers, aspectOptions) {
    this.base(arguments, title, message);

    this.__buttons = {};
    this.__handlers = handlers;

    if (buttons) {
      this.setButtons(buttons);
    }

    this.setIcon('icon/48/status/dialog-warning.png');
    this.__composeButtons();
    this.__composeAspects(aspectOptions);
  },

  properties : {
    buttons :
    {
      init : "okcancel",
      check : ["okcancel", "yesno", "yesnocancel"]
    }
  },

  members : {
    __handlers: null,
    __buttons: null,

    __composeAspects: function(aspectOptions) {
      if (aspectOptions['icon']) {
        this.setIcon(aspectOptions['icon']);
      }

      var support = ["ok", "yes", "no", "cancel"];

      for (var a in support) {
        if(aspectOptions[support[a]]) {
          this.__applyAspect(support[a], aspectOptions[support[a]]);
        }
      }
    },

    __applyAspect: function(id, aspect) {
      if(qx.lang.Type.isString(aspect)) {
        this.__getButton(id).setLabel(aspect)
      }
      else {
        if (aspect['icon']) {
          this.__getButton(id).setIcon(aspect['icon']);
        }

        if (aspect['label']) {
          this.__getButton(id).setLabel(aspect['label']);
        }
      }
    },

    __composeButtons: function() {
      var buttons = this.getButtons();

      if(buttons == "okcancel")
      {
        this.__getButton('ok').addListener('execute', function(e) {
          this.__buttonHandler('ok');
        }, this);

        this.__getButton('cancel').addListener('execute', function(e) {
          this.__buttonHandler('cancel');
        }, this);

        this._getButtonsBar().add(this.__getButton('ok'));
        this._getButtonsBar().add(this.__getButton('cancel'));
      }
      else if (buttons == "yesno" || buttons == "yesnocancel")
      {
        this.__getButton('yes').addListener('execute', function(e) {
          this.__buttonHandler('yes');
        }, this);

        this.__getButton('no').addListener('execute', function(e) {
          this.__buttonHandler('no');
        }, this);

        this._getButtonsBar().add(this.__getButton('yes'));
        this._getButtonsBar().add(this.__getButton('no'));

        if(buttons == "yesnocancel")
        {
          this.__getButton('cancel').addListener('execute', function(e) {
            this.__buttonHandler('cancel');
          }, this);

          this._getButtonsBar().add(this.__getButton('cancel'));
        }
      }
    },

    __getButton: function(id) {
      if(this.__buttons[id]) return this.__buttons[id];

      switch (id) {
        case "ok":
          this.__buttons[id] = new qx.ui.form.Button('OK', 'icon/16/actions/dialog-ok.png');
          break;
        case "yes":
            this.__buttons[id] = new qx.ui.form.Button('Yes', 'icon/16/actions/dialog-apply.png');
            break;
        case "no":
          this.__buttons[id] = new qx.ui.form.Button('No', 'icon/16/actions/process-stop.png');
          break;
        case "cancel":
          this.__buttons[id] = new qx.ui.form.Button('Cancel', 'icon/16/actions/dialog-cancel.png');
          break;
        default:

      }

      return this.__buttons[id];
    },

    __getContext: function() {
      if(this.__handlers['context']) {
         return this.__handlers['context'];
      }

      return this;
    },

    __buttonHandler: function(id) {
      var callback = this.__handlers[id];

      if(callback) {
        callback.call(this.__getContext());
      }

      this.close();
    }
  }
});
