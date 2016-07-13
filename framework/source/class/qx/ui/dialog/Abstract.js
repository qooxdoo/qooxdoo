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

qx.Class.define('qx.ui.dialog.Abstract',
{
  extend: qx.ui.window.Window,
  type: "abstract",

  construct: function() {
    this.base(arguments);

    this.setLayout(new qx.ui.layout.VBox());

    this.setMaxWidth(320);
    this.setResizable(false);

    this.add(this._getAtom());
    this.add(this._getButtonsBar());
  },

  properties : {
    modal :
    {
      refine : true,
      init : true
    },

    showClose : {
      refine : true,
      init : false
    },

    showMaximize : {
      refine : true,
      init : false
    },

    showMinimize : {
      refine : true,
      init : false
    },

    allowClose :
    {
      refine : true,
      init : false
    },

    allowMaximize :
    {
      refine : true,
      init : false
    },

    allowMinimize :
    {
      refine : true,
      init : false
    }
  },

  members: {
    _atom: null,
    _buttonsBar: null,

    _getAtom: function() {
      if(!this._atom) {
        this._atom = new qx.ui.basic.Atom();
        this._atom.setIconPosition("left");
        this._atom.setRich(true);
      }

      return this._atom;
    },

    _getButtonsBar: function() {
      if(!this._buttonsBar) {
        this._buttonsBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(0, 'center'));
      }

      return this._buttonsBar;
    },

    show: function() {
      this.base(arguments);
      this.center();
    },

    close: function() {
      this.base(arguments)
      this.dispose();
    }
  }
});
