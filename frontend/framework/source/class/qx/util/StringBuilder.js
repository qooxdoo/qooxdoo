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

#embed(qx.static/history/historyHelper.html)
#require(qx.core.Init)

************************************************************************ */

/**
 * A string builder class
 *
 * += operator is faster in Firefox and Opera.
 * Array push/join is faster in Internet Explorer
 *
 * Even with this wrapper, which costs some time, this is
 * faster in Firefox than the alternative Array concat in
 * all browsers (which is in relation to IE's performance issues
 * only marginal). The IE performance loss caused by this
 * wrapper is not relevant.
 *
 * So this class seems to be the best compromise to handle
 * string concatenation.
 */
qx.Class.define("qx.util.StringBuilder",
{
  extend : Array,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param varargs {String} variable number of strings to be added initially
   */
  construct : function(varargs)
  {
    Array.call(this);

    this.init();
    if (varargs != null) {
      this.add.apply(this, arguments);
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Resets the contents of the Stringbuilder
     * equivalent to <pre>str = ""; </pre>
     *
     * @type member
     * @return {void}
     * @signature function()
     */
    clear : qx.core.Variant.select("qx.client",
    {
      "default" : function() {
        this.length = 0;
      },

      "mshtml" : function()  {
        this._array = [];
      }
    }),


    /**
     * Returns the contents of the concatenated string
     *
     * @type member
     * @return {String} string content
     * @signature function()
     */
    get : qx.core.Variant.select("qx.client",
    {
      "default" : function() {
        return this.join("");
      },

      "mshtml" : function() {
        return this._array.join("");
      }
    }),


    /**
     * Append a variable number of string arguments. To only append
     * one use {@link #addOne} instead.
     *
     * @type member
     * @param varargs {String} variable number of strings to be added
     * @return {void}
     * @signature function(varargs)
     */
    add : qx.core.Variant.select("qx.client",
    {
      "default" : function() {},

      "mshtml" : function() {
        this._array.push.apply(this._array, arguments);
      }
    }),


    /**
     * Append one string argument. To append multiple items use
     * {@link #add} instead.
     *
     * @type members
     * @param item
     * @signature function(item)
     */
    addOne : qx.core.Variant.select("qx.client",
    {
      "default" : function(item) {},

      "mshtml" : function() {
        this._array.push(item);
      }
    }),


    /**
     * Initializes the contents of the Stringbuilder
     * equivalent to <pre>str = ""; </pre>
     *
     * @type member
     * @return {void}
     * @signature function()
     */
    init : qx.core.Variant.select("qx.client",
    {
      "default" : function() {
        this.length = 0;
      },

      "mshtml" :function() {
        this._array = [];
      }
    }),


    /**
     * Checks whether the strinb builder instance represents the epty string.
     *
     * @return {Boolean} whether the string is empty
     * @signature function()
     */
    isEmpty:  qx.core.Variant.select("qx.client",
    {
      "default" : function() {
        return this.lenght == 0;
      },

      "mshtml" :function() {
        if (this._array.length == 0) {
          return true;
        }

        for (var i=0; i< this._array.length; i++) {
          if (this._array[i] != "") {
            return false
          }
        }
        return true
      }
    }),


    /**
     * Returns the contents of the concatenated string
     *
     * @type member
     * @return {String} string content
     */
    toString : function() {}
  },

  defer : qx.core.Variant.select("qx.client",
  {
    "default" : function(statics, members)
    {
      members.add = Array.prototype.push;
      members.addOne = Array.prototype.push;
      members.toString = members.get;
    },

    "mshtml" : function(statics, members)
    {
      members.toString = members.get;

      // first use the plain IE StringBuilder and on window load replace it with a sub class
      // of Array obtained from an IFrame. This technique is described by Dean Edwards at
      // http://dean.edwards.name/weblog/2006/11/hooray/
      qx.core.Init.getInstance().addEventListener("load", function() {
        // create an <iframe>
        var iframe = document.createElement("iframe");
        iframe.src = qx.manager.object.AliasManager.getInstance().resolvePath("static/history/historyHelper.html")
        iframe.style.display = "none";

        document.body.appendChild(iframe);

        // write a script into the <iframe> and steal its Array object
        var doc = frames[frames.length - 1].document;
        doc.open();
        doc.write(
        	"<html><head><script>parent.qx.util.StringBuilder = Array;<\/script></head></html>"
        );
        doc.close();

        document.body.removeChild(iframe);

        qx.util.StringBuilder.prototype.add = qx.util.StringBuilder.prototype.push;
        qx.util.StringBuilder.prototype.addOne = qx.util.StringBuilder.prototype.push;
        qx.util.StringBuilder.prototype.get = function() {
          return this.join("");
        };
        qx.util.StringBuilder.prototype.toString = qx.util.StringBuilder.prototype.get;
        qx.util.StringBuilder.prototype.clear = function() {
          this.length = 0;
        };
        qx.util.StringBuilder.prototype.init = function() {
          this.length = 0;
        };
        qx.util.StringBuilder.prototype.isEmpty = function() {
          return this.lenght == 0;
        }
      });
    }
  })

});
