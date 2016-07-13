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
 *   var dialog = new qx.ui.dialog.Confirm('title', 'message', {
 *     ok: function() { [something]; },
 *     context: me
 *   });
*
* @asset(qx/icon/Oxygen/48/status/dialog-warning.png)
* @asset(qx/icon/${qx.icontheme}/48/status/dialog-warning.png)
* @asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)
* @asset(qx/icon/${qx.icontheme}/16/actions/dialog-cancel.png)
*/
qx.Class.define('qx.ui.dialog.Confirm',
{
  extend : qx.ui.dialog.Abstract,

  construct : function(title, message, handlers) {
    this.base(arguments, title, message);

    this.__buttons = {};
    this.__handlers = handlers;

    this._getAtom().setIcon('icon/48/status/dialog-warning.png');

    this.__getButton('ok').addListener('execute', this.__handleOk, this);
    this.__getButton('cancel').addListener('execute', function(e) {
      this.close();
    }, this);

    this._getButtonsBar().add(this.__getButton('ok'));
    this._getButtonsBar().add(this.__getButton('cancel'));
  },

  members : {
    __handlers: null,
    __buttons: null,

    __getButton: function(id) {
      if(this.__buttons[id]) return this.__buttons[id];

      if(id == 'ok') {
        this.__buttons[id] = new qx.ui.form.Button('OK', 'icon/16/actions/dialog-ok.png');
      }
      else if(id == 'cancel') {
        this.__buttons[id] = new qx.ui.form.Button('Cancel', 'icon/16/actions/dialog-cancel.png');
      }

      return this.__buttons[id];
    },

    __getContext: function() {
      if(this.__handlers['context']) {
         return this.__handlers['context'];
      }

      return this;
    },

    __handleOk: function(e) {
      var okCallbak = this.__handlers['ok'];

      if(okCallbak) {
        okCallbak.call(this.__getContext());
      }

      this.close();
    }
  }
});
