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
   * @param caption {String?null} Title of dialog.
   * @param message {String?null} Message to show.
   * @param icon {String?null} Icon to use.
   */
  construct : function(caption, message, icon) {
    caption = caption || '';
    message = message || '';

    this.base(arguments);

    this.setLayout(new qx.ui.layout.VBox());

    this.setMaxWidth(320);
    this.setResizable(false);

    this._createChildControl("atom");
    this._createChildControl("buttons-bar");

    this.setCaption(caption);
    this.setMessage(message);
    this.setIcon(icon);
  },

  properties : {
    // overridden
    appearance :
    {
      refine : true,
      init : "dialog"
    },

    autoDispose: {
      init: true,
      check: "Boolean"
    },

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
    },

    message: {
      check: "String",
      nullable: true,
      apply: "_applyMessage"
    }
  },

  members: {

    // overridden
    _createChildControlImpl : function(id) {
      var control;

      switch (id) {
        case "atom":
          control = new qx.ui.basic.Atom();
          control.setIconPosition("left");
          control.setRich(true);
          this.add(control);
          break;
        case "buttons-bar":
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, 'right'));
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },

    // property apply
    _applyCaptionBarChange : function(value, old, name) {
      if (name == "icon") {
        this.getChildControl("atom").setIcon(value);
      }
      else {
        this.base(arguments, value, old);
      }
    },

    // property apply
    _applyMessage : function(val, old) {
      this.getChildControl("atom").setLabel(val);
    },

    // overridden
    show : function() {
      this.base(arguments);
      this.center();
    },

    // overridden
    close : function() {
      this.base(arguments);

      if(this.isAutoDispose()) {
        this.dispose();
      }
    }
  }
});
