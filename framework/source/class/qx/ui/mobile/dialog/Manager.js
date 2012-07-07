/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)

************************************************************************ */

/**
 * Very basic dialog manager. Displays a native alert or confirm dialog if
 * the application is running in a PhoneGap environment. For debugging in a browser
 * it displays the browser <code>alert</code> or <code>confirm</code> dialog. In the near
 * future this should be replaced by dialog widgets.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *    var buttons = [];
 *    buttons.push(qx.locale.Manager.tr("OK"));
 *    buttons.push(qx.locale.Manager.tr("Cancel"));
 *    var title = "Delete item";
 *    var text = "Do you want to delete the item?"
 *    qx.ui.mobile.dialog.Manager.getInstance().confirm(title, text, function(index) {
 *      if (index==1) {
 *        // delete the item
 *      }
 *    }, this, buttons);
 * </pre>
 *
 * This example displays a confirm dialog and defines a button click handler.
 */
qx.Class.define("qx.ui.mobile.dialog.Manager",
{
  extend : qx.core.Object,
  type : "singleton",


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics:
  {
    INPUT_DIALOG: 1,
    MESSAGE_DIALOG: 2,
    WARNING_DIALOG: 3,
    ERROR_DIALOG: 4,
    WAITING_DIALOG: 5
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Displays an alert box. When the application is running in an PhoneGap
     * environment, a native alert box is shown. For debugging in a browser, a
     * browser alert is shown.
     *
     * @param title {String} The title of the alert box
     * @param text {String} The text to display in the alert box
     * @param handler {Function} The handler to call when the <code>OK</code> button
     *     was pressed
     * @param scope {Object} The scope of the handler
     * @param button {String} The button title
     *
     * @lint ignoreDeprecated(alert)
     */
    alert : function(title, text, handler, scope, button)
    {
      // TOOD : MOVE THIS TO PHONEGAP CLASS
      if (qx.core.Environment.get("phonegap") && qx.core.Environment.get("phonegap.notification")) {
        var callback = function() {
          if (handler) {
            handler.call(scope);
          }
        }
        var button = this.__processDialogButtons(button);
        return navigator.notification.alert(text, callback, title, button);
      }
      else
      {
        return this.__showNonNativeDialog(title, text, handler, scope, [button], qx.ui.mobile.dialog.Manager.MESSAGE_DIALOG);
      }
    },


    /**
     * Displays a confirm box. When the application is running in an PhoneGap
     * environment, a native confirm box is shown. For debugging in a browser, a
     * browser confirm is shown.
     *
     * @param title {String} The title of the confirm box
     * @param text {String} The text to display in the confirm box
     * @param handler {Function} The handler to call when the <code>OK</code> button
     *     was pressed. The first parameter of the function is the <code>index</code>
     *     of the pressed button, starting from 1.
     * @param scope {Object} The scope of the handler
     * @param buttons {String[]} Each text entry of the array represents a button and
     *     its title
     * @lint ignoreDeprecated(confirm)
     */
    confirm : function(title, text, handler, scope, buttons)
    {
      if (qx.core.Environment.get("phonegap") && qx.core.Environment.get("phonegap.notification"))
      {
        var callback = function(index)
        {
          handler.call(scope, index-1);
        }
        var buttons = this.__processDialogButtons(buttons);
        return navigator.notification.confirm(text, callback, title, buttons);
      }
      else
      {
        return this.__showNonNativeDialog(title, text, handler, scope, buttons, qx.ui.mobile.dialog.Manager.MESSAGE_DIALOG);
      }
    },

    /**
     * Displays an input dialog.
     *
     * @param title {String} The title of the input dialog.
     * @param text {String} The text to display in the input dialog.
     * @param handler {Function} The handler to call when the <code>OK</code> button
     *     was pressed. The first parameter of the function is the <code>index</code>
     *     of the pressed button, starting from 1.
     * @param scope {Object} The scope of the handler
     * @param buttons {String[]} Each text entry of the array represents a button and
     *     its title
     * @lint ignoreDeprecated(confirm)
     */
    input : function(title, text, handler, scope, buttons)
    {
      return this.__showNonNativeDialog(title, text, handler, scope, buttons, qx.ui.mobile.dialog.Manager.INPUT_DIALOG);
    },

    /**
     * Displays an error dialog. When the application is running in an PhoneGap
     * environment, a native error dialog is shown. For debugging in a browser, a
     * browser confirm is shown.
     *
     * @param title {String} The title of the error dialog.
     * @param text {String} The text to display in the error dialog.
     * @param handler {Function} The handler to call when the <code>OK</code> button
     *     was pressed. The first parameter of the function is the <code>index</code>
     *     of the pressed button, starting from 1.
     * @param scope {Object} The scope of the handler
     * @param button {String} The text entry represents a button and its title
     * @lint ignoreDeprecated(confirm)
     */
    error : function(title, text, handler, scope, button)
    {
      if (qx.core.Environment.get("phonegap") && qx.core.Environment.get("phonegap.notification")) {
        var callback = function() {
          if (handler) {
            handler.call(scope);
          }
        }
        var button = this.__processDialogButtons(button);
        return navigator.notification.alert(text, callback, title, button);
      }
      else
      {
        return this.__showNonNativeDialog(title, text, handler, scope, button, qx.ui.mobile.dialog.Manager.ERROR_DIALOG);
      }
    },


    /**
     * Displays a warning dialog. When the application is running in an PhoneGap
     * environment, a native warning dialog is shown. For debugging in a browser, a
     * browser confirm is shown.
     *
     * @param title {String} The title of the warning dialog.
     * @param text {String} The text to display in the warning dialog.
     * @param handler {Function} The handler to call when the <code>OK</code> button
     *     was pressed. The first parameter of the function is the <code>index</code>
     *     of the pressed button, starting from 1.
     * @param scope {Object} The scope of the handler
     * @param button {String} The text entry represents a button and its title
     * @lint ignoreDeprecated(confirm)
     */
    warning : function(title, text, handler, scope, button)
    {
      if (qx.core.Environment.get("phonegap") && qx.core.Environment.get("phonegap.notification")) {
        var callback = function() {
          if (handler) {
            handler.call(scope);
          }
        }
        var button = this.__processDialogButtons(button);
        return navigator.notification.alert(text, callback, title, button);
      }
      else
      {
        return this.__showNonNativeDialog(title, text, handler, scope, button, qx.ui.mobile.dialog.Manager.WARNING_DIALOG);
      }
    },


    /**
     * Displays a waiting dialog.
     *
     * @param title {String} The title of the waiting dialog.
     * @param text {String} The text to display in the waiting dialog.
     * @param handler {Function} The handler to call when the <code>OK</code> button
     *     was pressed. The first parameter of the function is the <code>index</code>
     *     of the pressed button, starting from 1.
     * @param scope {Object} The scope of the handler
     * @param buttons {String[]} Each text entry of the array represents a button and
     *     its title
     * @lint ignoreDeprecated(confirm)
     */
    wait : function(title, text, handler, scope, buttons)
    {
      return this.__showNonNativeDialog(title, text, handler, scope, buttons, qx.ui.mobile.dialog.Manager.WAITING_DIALOG);
    },


    /**
     * Processes the dialog buttons. Converts them to PhoneGap compatible strings.
     *
     * @param buttons {String[]} Each text entry of the array represents a button and
     *     its title
     * @return {String} The concatenated, PhoneGap compatible, button string
     */
    __processDialogButtons: function(buttons)
    {
      if(buttons) {
        if(buttons instanceof Array) {
          buttons = buttons.join(",");
        } else {
          buttons = ""+buttons;
        }
      }
      return buttons;
    },


    /**
     * Shows a dialog widget.
     *
     * @param title {String} The title of the dialog.
     * @param text {String} The text to display in the dialog.
     * @param handler {Function} The handler to call when the <code>OK</code> button
     *     was pressed. The first parameter of the function is the <code>index</code>
     *     of the pressed button, starting from 1.
     * @param scope {Object} The scope of the handler
     * @param buttons {String[]} Each text entry of the array represents a button and
     *     its title
     * @param dialogType {Integer} One of the static dialog types.
     */
    __showNonNativeDialog: function(title, text, handler, scope, buttons, dialogType)
    {
      var widget = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox().set({alignY: "middle"}));
      var dialog = new qx.ui.mobile.dialog.Dialog(widget);
      dialog.setTitle(title);

      if(dialogType == qx.ui.mobile.dialog.Manager.ERROR_DIALOG) {
        dialog.setIcon('qx/mobile/icon/android/warning.png');
      }
      if(dialogType == qx.ui.mobile.dialog.Manager.WARNING_DIALOG) {
        dialog.setIcon('qx/mobile/icon/android/warning.png');
      }

      if(dialogType == qx.ui.mobile.dialog.Manager.WAITING_DIALOG)
      {
        var waitingWidget = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox().set({alignX: "center"}));
        widget.add(waitingWidget);
        waitingWidget.add(new qx.ui.mobile.dialog.BusyIndicator(text));
      }
      else
      {
        var labelWidget = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox().set({alignX: "center"}));
        labelWidget.add(new qx.ui.mobile.basic.Label(text));
        widget.add(labelWidget);
        if(dialogType == qx.ui.mobile.dialog.Manager.INPUT_DIALOG)
        {
          var inputWidget = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox().set({alignX: "center"}));
          var inputText = new qx.ui.mobile.form.TextField();
          inputWidget.add(inputText);
          widget.add(inputWidget);
        }

        var container = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox().set({alignX: "center"}));
        for(var i=0, l=buttons.length; i<l; i++)
        {
          var button = new qx.ui.mobile.form.Button(buttons[i]);
          /* see the comment in android.css for width: 0 for toolbar-button class*/
          button.addCssClass('dialogButton');
          container.add(button, {flex:1});
          var callback = (function(index){
            return function()
            {
              dialog.hide();
              if(handler) {
                handler.call(scope, index, inputText ? inputText.getValue() : null);
              }
              dialog.destroy();
            };
          })(i);
          button.addListener("tap", callback);
        }
        widget.add(container);
      }
      dialog.setModal(true);
      dialog.show();
      if(inputText) {
        inputText.getContainerElement().focus();
      }
      return dialog;
    }
  }
});
