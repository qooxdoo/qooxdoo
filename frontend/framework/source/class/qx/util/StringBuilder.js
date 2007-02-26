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

************************************************************************ */

/**
 * A string builder class
 * <p>
 * += operator is faster in Firefox and Opera.
 * Array push/join is faster in Internet Explorer
 * </p><p>
 * Even with this wrapper, which costs some time, this is
 * faster in Firefox than the alternative Array concat in
 * all browsers (which is in relation to IE's performance issues
 * only marginal). The IE performance loss caused by this
 * wrapper is not relevant.
 * </p><p>
 * So this class seems to be the best compromise to handle
 * string concatenation.</p>
 */
qx.Clazz.define("qx.util.StringBuilder",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    qx.core.Object.call(this);

    this.init();
    this.add.apply(this, arguments);
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
     */
    clear : qx.core.Variant.select("qx.client", {
      "default" : function() {
        return this._string;
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
     */
    get : qx.core.Variant.select("qx.client", {
      "default" : function() {
        return this._string;
      },

      "mshtml" : function() {
        return this._array.join("");
      }
    }),


    /**
     * Append a variable number of string arguments
     *
     * @type member
     * @param varargs {String} variable number os strings to be added
     * @return {void}
     */
    add : qx.core.Variant.select("qx.client", {
      "default" : function() {
        this._string += Array.prototype.join.call(arguments, "");
      },

      "mshtml" : function() {
        this._array.push.apply(this._array, arguments);
      }
    }),


    /**
     * Initializes the contents of the Stringbuilder
     * equivalent to <pre>str = ""; </pre>
     *
     * @type member
     * @return {void}
     */
    init : qx.core.Variant.select("qx.client", {
      "default" : function() {
        this._string = "";
      },

      "mshtml" :function() {
        this._array = [];
      }
    }),


    /**
     * Destructor
     *
     * @type member
     * @return {void}
     */
    dispose : qx.core.Variant.select("qx.client", {
      "default" : function()
      {
        if (this.getDisposed()) {
          return;
        }

        this._string = null;

        qx.core.Object.prototype.dispose.call(this);
      },

      "mshtml" : function()
      {
        if (this.getDisposed()) {
          return;
        }

        this._array = null;

        qx.core.Object.prototype.dispose.call(this);
      }
    }),


    /**
     * Returns the contents of the concatenated string
     *
     * @type member
     * @return {String} string content
     */
    toString : function() {
      return this.get();
    }

  }
});