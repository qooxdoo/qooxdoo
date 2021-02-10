/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Contains some common methods available to all log appenders.
 * 
 * @deprecated {6.0} See qx.util.appender.Formatter instead
 */
qx.Bootstrap.define("qx.log.appender.Util",
{
  statics: {
    toHtml: null,
    toText: null,
    toTextArray: null,
    escapeHTML: qx.log.appender.Formatter.escapeHTML
  },
  
  defer: function(statics) {
    var formatter = qx.log.appender.Formatter.getFormatter();
    [ "toHtml", "toText", "toTextArray", "escapeHTML" ].forEach(function(name) {
      statics[name] = function() {
        return formatter[name].apply(formatter, qx.lang.Array.fromArguments(arguments));
      };
    });
  }
});