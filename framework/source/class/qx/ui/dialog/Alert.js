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
 * @asset(qx/icon/${qx.icontheme}/48/status/dialog-information.png)
 * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)
 */
qx.Class.define('qx.ui.dialog.Alert',
{
  extend : qx.ui.dialog.Abstract,

  construct : function(title, message) {
    title = title || 'Info';
    message = message || '';

    this.base(arguments);

    this._initDialog(title, message);
    this._getAtom().setIcon('icon/48/status/dialog-information.png');

    this.__btn = new qx.ui.form.Button('Close', 'icon/16/actions/dialog-ok.png');

    this.__btn.addListener('execute', function(e) {
      this.close();
    }, this);

    this._getButtonsBar().add(this.__btn);
  },

  members : {
    __btn: null,
    __title: null,
    __message: null,

    _initDialog : function(title, message) {
      this.__title = title;
      this.setMessage(message);
    },

    setTitle : function(title) {
      this.__title = title;

      var label = '<b>' + this.__title +  '</b>';
      var message = this.getMessage();

      if (message) {
        label += '<br/>' + message;
      }

      this._getAtom().setLabel(label);
    },

    setMessage: function(message) {
      this.__message = message;

      var label = this.__message;
      var title = this.getTitle();

      if (title) {
        label = '<b>' + title +  '</b><br/>' + label;
      }

      this._getAtom().setLabel(label);
    },

    getTitle: function() {
      return this.__title;
    },

    getMessage: function() {
      return this.__message;
    }
  }
});
