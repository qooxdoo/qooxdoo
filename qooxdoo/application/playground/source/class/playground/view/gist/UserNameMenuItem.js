/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * A special menu item contining a label and a textfield.
 */
qx.Class.define("playground.view.gist.UserNameMenuItem", 
{
  extend : qx.ui.core.Widget,


  construct : function()
  {
    this.base(arguments);
    
    this.setAppearance("menu-button");
    
    var layout = new qx.ui.layout.Grid(5, 5);
    layout.setColumnFlex(1, 1);
    layout.setRowFlex(0, 1);
    layout.setRowAlign(0, "left", "middle");
    this._setLayout(layout);
    this.setPadding(4);
    var initUserName = qx.bom.Cookie.get("playgroundUser");
    this.__textField = new qx.ui.form.TextField(initUserName);
    this.__textField.set({
      width: 50,
      anonymous: true
    });
    
    var label = new qx.ui.basic.Label(this.tr("Username"));
    label.setAnonymous(true);
    this._add(label, {row: 0, column: 0});
    this._add(this.__textField, {row: 0, column: 1});
    
    this.__textField.addListener("changeValue", function(e) {
      // set the cookie
      qx.bom.Cookie.set("playgroundUser", e.getData(), 100);
      // invoke a reload
      this.fireDataEvent("reload", e.getData());
    }, this);
    
    // sync the selected state
    this.addListener("syncAppearance", function() {
      this.hasState("selected") ? this.__textField.focus() : null;
    }, this);
    
    // EVIL HACK FOR THE MENU MANAGER!!!!
    var manager = qx.ui.menu.Manager.getInstance();
    var onKeyPressLeft = manager._onKeyPressLeft;
    var onKeyPressRight = manager._onKeyPressRight;
    
    var self = this;
    manager._onKeyPressLeft = function(menu) {
      if ((menu.getSelectedButton() instanceof self.constructor)) {
        var cursorPos = self.__textField.getTextSelectionStart();
        if (cursorPos != 0) {
          self.__textField.setTextSelection(cursorPos - 1, cursorPos - 1);
          return;
        }
      }
      // default action
      onKeyPressLeft.call(manager, menu);
    };
    
    manager._onKeyPressRight = function(menu) {
      if ((menu.getSelectedButton() instanceof self.constructor)) {
        var cursorPos = self.__textField.getTextSelectionStart();
        if (cursorPos != self.__textField.getValue().length) {
          self.__textField.setTextSelection(cursorPos + 1, cursorPos + 1);
          return;
        }
      }
      onKeyPressRight.call(manager, menu);
    };
  },


  events : {
    /**
     * Fired, if the username has changed.
     */
    "reload" : "qx.event.type.Data"
  },


  members :
  {
    __textField : null,


    /**
     * Necessary implementation for the menu layout.
     * @return {Array} An array containing the sizes.
     */
    getChildrenSizes : function()
    {
      // iconWidth, labelWidth, shortcutWidth, arrowWidth
      return [0, this.getSizeHint().width, 0, 0];
    },


    /**
     * Method for marking the textfield as invalid.
     * @param invalid {Boolean} true, if something is wrong.
     * @param message {String} The error message.
     */
    markInvalid : function(invalid, message) 
    {
      this.__textField.setValid(!invalid);
      this.__textField.setInvalidMessage(message || "");
    },
    
    
    /**
     * Dummy implementataion for the menu, returning always null.
     * @return {null} Always null!
     */
    getMenu : function() {
      return null;
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function() {
    this._disposeObjects("__textField");
  }
});
