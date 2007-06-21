/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)
#ignore(auto-require)

************************************************************************ */

/**
 * This class emulates the Firebug "console" for browsers without this
 * extension. It is relatively lightweight and only implement the basic
 * features.
 */
qx.Class.define("qx.core.Log",
{
  statics :
  {
    /**
     * Log a message
     *
     * @param varargs {arguments} One or multiple messages
     */
    log: function(varargs) {
      this._write(arguments, "");
    },


    /**
     * Log a message as debug
     *
     * @param varargs {arguments} One or multiple messages
     */
    debug: function(varargs) {
      this._write(arguments, "debug");
    },


    /**
     * Log a message as info
     *
     * @param varargs {arguments} One or multiple messages
     */
    info: function(varargs) {
      this._write(arguments, "info");
    },


    /**
     * Log a message as warn
     *
     * @param varargs {arguments} One or multiple messages
     */
    warn: function(varargs) {
      this._write(arguments, "warning");
    },


    /**
     * Log a message as error
     *
     * @param varargs {arguments} One or multiple messages
     */
    error: function(varargs) {
      this._write(arguments, "error");
    },


    /**
     * Clear console
     */
    clear : function()
    {
      if (this._frame) {
        this._frame.innerHTML = "";
      }
    },


    /**
     * Open console
     */
    open : function()
    {
      if (!this._frame) {
        this._create();
      }

      this._frame.style.display = "";
    },


    /**
     * Close console
     */
    close : function()
    {
      if (!this._frame) {
        this._create();
      }

      this._frame.style.display = "none";
    },

    emu : true,





    /**
     * Helper function to mark method which are not supported
     */
    _unsupported : function(){
      this.warn("This method is not supported.");
    },

    _map :
    {
      debug : "blue",
      info : "green",
      warning : "orange",
      error : "red"
    },

    _cache : [],

    /**
     * Writes log message
     * @param args {Array} Messages to write to the log
     * @param level {String} Log level
     */
    _write : function(args, level)
    {
      if (!this._frame) {
        this._create();
      }

      if (!this._frame)
      {
        this._cache.push(arguments);
        return;
      }

      var important = level == "warning" || level == "error";
      var node = document.createElement("div");
      var sty = node.style;

      sty.borderBottom = "1px solid #CCC";
      sty.padding = "1px 8px";
      sty.margin = "1px 0";
      sty.color = this._map[level] || "blue";

      if (important) {
        sty.background = "#FFFFE0";
      }

      for (var i=0, l=args.length; i<l; i++)
      {
        node.appendChild(document.createTextNode(args[i]));

        if (i<l-1) {
          node.appendChild(document.createTextNode(", "));
        }
      }

      this._frame.appendChild(node);
      this._frame.scrollTop = this._frame.scrollHeight;

      if (important) {
        this.open();
      }
    },

    /**
     * Creates container for log messages
     */
    _create : function()
    {
      if (!document.body) {
        return;
      }

      var frame = this._frame = document.createElement("div");

      frame.className = "console";

      var sty = frame.style;

      sty.zIndex = "2147483647";
      sty.background = "white";
      sty.position = "absolute";
      sty.display = "none";
      sty.width = "100%";
      sty.height = "200px";
      sty.left = sty.right = sty.bottom = 0;
      sty.borderTop = "3px solid #134275";
      sty.overflow = "auto";
      sty.font = '10px normal Consolas, "Bitstream Vera Sans Mono", "Courier New", monospace';
      sty.color = "blue";

      document.body.appendChild(frame);

      if (this._cache)
      {
        for (var i=0, c=this._cache, l=c.length; i<l; i++) {
          this._write(c[i][0], c[i][1]);
        }

        this._cache = null;
      }
    }
  },

  defer : function(statics, members, properties)
  {
    // Unsupported methods
    statics.assert = statics.dir = statics.dirxml = statics.group =
      statics.groupEnd = statics.time = statics.timeEnd =
      statics.count = statics.trance = statics.profile =
      statics.profileEnd = statics._unsupported;

    // Firebug emulation
    if (!window.console) {
      window.console = statics;
    } else if (window.console && (!console.debug || !console.trace || !console.group)) {
      // WebKit defines its own logger
      // TODO: find a better way to support logging in webkit.
      window.console = statics;
    }
  }
});
