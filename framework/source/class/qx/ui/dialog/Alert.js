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

    this.base(arguments, title, message, 'icon/48/status/dialog-information.png');
    this._getButtonsBar().add(this.__getButton());
  },

  members : {
    __button: null,

    __getButton : function() {
      if(!this.__button)
      {
        this.__button = new qx.ui.form.Button('Close', 'icon/16/actions/dialog-ok.png');
        this.__button.addListener('execute', function(e) {
          this.close();
        }, this);
      }

      return this.__button;
    }
  }
});
