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

qx.Class.define("widgetbrowser.view.WindowBusy", {
  extend: qx.ui.window.Window,
  include: [qx.ui.core.MBusyBlocker],

  construct: function() {
    this.base(arguments);

    this.setCaption('A blockable window');
    this.setLayout(new qx.ui.layout.Basic());

    this.add(new qx.ui.basic.Label('A simple label.'));

    this.setWidth(300);
    this.setHeight(150);

    this.setAllowBusyPopup(true);
  }
});
