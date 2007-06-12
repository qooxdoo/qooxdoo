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

#embed(qx.static/stringbuilder/helper.html)
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
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * @internal
     */
    __init : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        // first use the plain IE StringBuilder and on window load replace it with a sub class
        // of Array obtained from an IFrame. This technique is described by Dean Edwards at
        // http://dean.edwards.name/weblog/2006/11/hooray/
        qx.core.Init.getInstance().addEventListener("load", this.__onload, this);
      },

      "default" : null
    }),


    /**
     * @internal
     */
    __onload : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        // create an <iframe>
        this._frame = document.createElement("iframe");
        this._frame.style.visibility = "hidden";
        this._frame.src = qx.io.Alias.getInstance().resolve("static/stringbuilder/helper.html")
        document.body.appendChild(this._frame);
      },

      "default" : null
    }),


    /**
     * @internal
     */
    rebuild : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(arr)
      {
        var prot = arr.prototype;

        // Patch instance methods
        prot.add = prot.push;
        prot.toString = prot.get = new Function("return this.join('');");
        prot.clear = prot.init = new Function("this.length = 0;");
        prot.isEmpty = new Function("return this.length === 0;");

        // Store under StringBuilder
        qx.util.StringBuilder = arr;

        // Remove helper frame
        document.body.removeChild(this._frame);
      },

      "default" : null
    })
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
     * equivalent to <pre class='javascript'>str = ""; </pre>
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
     * Initializes the contents of the Stringbuilder
     * equivalent to <pre class='javascript'>str = ""; </pre>
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
    isEmpty : qx.core.Variant.select("qx.client",
    {
      "default" : function() {
        return this.length == 0;
      },

      "mshtml" :function()
      {
        if (this._array.length == 0) {
          return true;
        }

        for (var i=0; i< this._array.length; i++) {
          if (this._array[i] != "") {
            return false;
          }
        }

        return true;
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




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : qx.core.Variant.select("qx.client",
  {
    "default" : function(statics, members)
    {
      members.add = Array.prototype.push;
      members.toString = members.get;
    },

    "mshtml" : function(statics, members)
    {
      members.toString = members.get;
      statics.__init();
    }
  })
});
