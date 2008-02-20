/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

qx.Bootstrap.define("qx.log.appender.Native",
{
  statics :
  {
    process : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(entry)
      {
        if (window.console && console.firebug) {
          console[entry.level].apply(console, this.__toArguments(entry.items));
        }
      },

      "opera" : function(entry)
      {
        if (window.opera && opera.postError) {
          opera.postError.apply(opera, this.__toArguments(entry.items));
        }
      },

      "default" : function(entry) {}
    }),

    __toArguments : function(items)
    {
      var output = [];

      for (var i=0, l=items.length; i<l; i++) {
        output.push(items[i].text);
      }

      return output;
    }
  },

  defer : function(statics) {
    qx.log.Logger.register(statics);
  }
});
