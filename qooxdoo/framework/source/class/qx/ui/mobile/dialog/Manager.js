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
 */
qx.Class.define("qx.ui.mobile.dialog.Manager",
{
  extend : qx.core.Object,
  type : "singleton",

  members : 
  {
    // TOOD : MOVE THIS TO PHONE GAP CLASS
    alert : function(title, text, handler, scope, button)
    {
      if (qx.core.Environment.get("phonegap") && qx.core.Environment.get("phonegap.notification")) {
        var callback = function() {
          if (handler) {
            handler.call(scope);
          }
        }
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
        var result = true;
        alert(text);
        if (handler) {
          handler.call(scope);
        }
      }
    },


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
