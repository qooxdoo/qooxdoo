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
 * BusyIndicator is a popup widget for display a little feedback to users meanwhile
 * something is busy or loading.
 * This widget is just the popup and do not block other widgets.
 *
 * This widget is used primarily by MBusyBlocker mixin.
 *
 * @asset(qx/loading16.gif)
 */
qx.Class.define('qx.ui.popup.BusyIndicator',
{
  extend: qx.ui.popup.Popup,

  construct: function(label) {
    label = label || 'Please wait...';
    this.base(arguments, new qx.ui.layout.Atom());

    this.__atom = new qx.ui.basic.Atom(label, 'qx/loading16.gif');

    this.setAutoHide(false);
    this.setPadding(3, 6, 3, 6);
    this.add(this.__atom);
  },

  members: {
    __atom: null,

    setCaption: function(caption) {
      this.__atom.setLabel(caption);
    }
  }
});
