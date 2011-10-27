/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 - 2009 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Appender for logging the Iframe.
 */
qx.Class.define("inspector.console.Appender", {

  statics :
  {
    consoleView : null,

    /**
     * Processes a single log entry
     *
     * @signature function(entry)
     * @param entry {Map} The entry to process
     * @return {void}
     */
    process : function(entry)
    {
      if (this.consoleView && !qx.core.ObjectRegistry.inShutDown)
      {
        var text = this.__toText(entry);

        if (entry.level == "info") {
          this.consoleView.info(text);
        } else if (entry.level == "warn") {
          this.consoleView.warn(text);
        } else if (entry.level == "error") {
          this.consoleView.error(text);
        } else {
          this.consoleView.debug(text);
        }
      }
    },

    /**
     * Convert the log entry to a string value.
     *
     * @param entry {Map} The log entry.
     * @return {string} Entry as string value.
     */
    __toText : function(entry)
    {
      var iFrameWindow = qx.core.Init.getApplication().getIframeWindowObject();
      var output = new qx.util.StringBuilder();
      var item, msg, sub, list;

      output.add(entry.offset, "ms ");

      if (entry.object)
      {
        var obj = iFrameWindow.qx.core.ObjectRegistry.fromHashCode(entry.object);
        if (obj) {
          output.add(obj.classname, "[", obj.$$hash, "]: ");
        }
      }
      else if (entry.clazz)
      {
        output.add(entry.clazz.classname, ": ");
      }

      var items = entry.items;
      for (var i=0, il=items.length; i<il; i++)
      {
        item = items[i];
        msg = item.text;

        if (msg instanceof iFrameWindow.Array)
        {
          var list = [];

          for (var j=0, jl=msg.length; j<jl; j++)
          {
            sub = msg[j];
            if (typeof sub === "string") {
              list.push(this.__escapeHTML(sub));
            } else if (sub.key) {
              list.push(sub.key + ": " + this.__escapeHTML(sub.text));
            } else {
              list.push(this.__escapeHTML(sub.text));
            }
          }

          if (item.type === "map") {
            output.add("{ ", list.join(", "), " }");
          } else {
            output.add("[ ", list.join(", "), " ]");
          }
        }
        else
        {
          output.add(this.__escapeHTML(msg));
        }
      }

      return output.get();
    },

    /**
     * Escape the string value to HTML.
     *
     * @param value {String} value to escape
     * @return {String} escaped Value.
     */
    __escapeHTML : function(value) {
      return this.consoleView._console.escapeHtml(value);
    }
  }
});