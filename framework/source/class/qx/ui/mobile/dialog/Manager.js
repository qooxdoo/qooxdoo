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
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
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
        // Make sure we have strings
        if (text) {
          text = ""+ text;
        }
        if (title) {
          title = ""+title;
        }
        if (button) {
          button = ""+button;
        }
        navigator.notification.alert(text, callback, title, button);
      }
      else
      {
        alert(text);
        if (handler) {
          handler.call(scope);
        }
      }
    },


    /**
     * Displays a confirm box. When the application is running in an PhoneGap
     * environment, a native confirm box is shown. For debugging in a browser, a
     * browser confirm is shown.
     *
     * @param title {String} The title of the alert box
     * @param text {String} The text to display in the alert box
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
          handler.call(scope, index);
        }
        if (text) {
          text = ""+ text;
        }
        if (title) {
          title = ""+title;
        }
        if (buttons) {
          buttons = buttons.join(",");
        }
        navigator.notification.confirm(text, callback, title, buttons);
      }
      else
      {
        var result = confirm(text);
        var index = result ? 1 : 2;
        handler.call(scope, index);
      }
    }
  }
});
