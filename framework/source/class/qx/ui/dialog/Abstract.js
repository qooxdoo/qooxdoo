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
 * This is the base class for dialogs.
 *
 * For this class a dialog has been thinking as is a modal window
 * with a title, a message, an icon and some action button(s)
 * and without the captionbar elements.
 */
qx.Class.define('qx.ui.dialog.Abstract', {
  extend : qx.ui.window.Window,
  type : "abstract",

  /**
   * @param title {String?null} Title of dialog.
   * @param message {String?null} Message to show.
   * @param icon {String?null} Icon to use.
   */
  construct : function(title, message, icon) {
    title = title || '';
    message = message || '';

    this.base(arguments);

    this.setLayout(new qx.ui.layout.VBox());

    this.setMaxWidth(320);
    this.setResizable(false);

    this.add(this._getAtom());
    this.add(this._getButtonsBar());

    this._initDialog(title, message);

    if (icon != undefined) {
      this._getAtom().setIcon(icon);
    }
  },

  properties : {
    modal : {
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

    allowClose : {
      refine : true,
      init : false
    },

    allowMaximize : {
      refine : true,
      init : false
    },

    allowMinimize : {
      refine : true,
      init : false
    }
  },

  members: {
    __title: null,
    __message: null,

    /**
     * This component is the real element for shown all dialog info (title, message and icon).
     * @type {qx.ui.basic.Atom}
     */
    _atom: null,

    /**
     * This component is used for store the buttons of dialog implementations.
     * @type {qx.ui.xontainerComposite}
     */
    _buttonsBar: null,

    /**
     * Return the internal Atom instance.
     * @return {qx.ui.basic.Atom} The internal Atom instance.
     */
    _getAtom: function() {
      if(!this._atom) {
        this._atom = new qx.ui.basic.Atom();
        this._atom.setIconPosition("left");
        this._atom.setRich(true);
      }

      return this._atom;
    },

    /**
     * @return {qx.ui.container.Composite} The internal container for buttons.
     */
    _getButtonsBar: function() {
      if(!this._buttonsBar) {
        this._buttonsBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, 'center'));
      }

      return this._buttonsBar;
    },

    /**
     * Internal initializer of dialog.
     */
    _initDialog : function(title, message) {
      this.__title = title;
      this.setMessage(message);
    },

    /**
     * @param title {String} Title of dialog.
     */
    setTitle : function(title) {
      this.__title = title;

      var label = '<b>' + this.__title +  '</b>';
      var message = this.getMessage();

      if (message) {
        label += '<br/>' + message;
      }

      this._getAtom().setLabel(label);
    },

    /**
     * @param message {String} Message to show.
     */
    setMessage: function(message) {
      this.__message = message;

      var label = this.__message;
      var title = this.getTitle();

      if (title) {
        label = '<b>' + title +  '</b><br/>' + label;
      }

      this._getAtom().setLabel(label);
    },

    /**
     * @param icon {String} Icon to use
     */
    setIcon : function(icon) {
      this._getAtom().setIcon(icon);
    },

    /**
     * @return {String} The title of dialog.
     */
    getTitle: function() {
      return this.__title;
    },

    /**
     * @return {String} The message of dialog.
     */
    getMessage: function() {
      return this.__message;
    },

    // overridden
    show: function() {
      this.base(arguments);
      this.center();
    },

    // overridden
    close: function() {
      this.base(arguments)
      this.dispose();
    }
  }
});
