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

************************************************************************ */

/**
 * Collection of helper methods operatinf on functions.
 */
qx.Clazz.define("qx.lang.Function",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      SIMPLE RETURN METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Simply return true.
     *
     * @type static
     * @return {Boolean} Always returns true.
     */
    returnTrue : function() {
      return true;
    },


    /**
     * Simply return false.
     *
     * @type static
     * @return {Boolean} Always returns false.
     */
    returnFalse : function() {
      return false;
    },


    /**
     * Simply return null.
     *
     * @type static
     * @return {var} Always returns null.
     */
    returnNull : function() {
      return null;
    },


    /**
     * Return "this".
     *
     * @type static
     * @return {Object} Always returns "this".
     */
    returnThis : function() {
      return this;
    },


    /**
     * Used to return a refernce to an singleton. Classes which should act as singletons can use this
     * function to implement the "getInstance" methods.
     *
     * @type static
     * @return {Object} TODOC
     */
    returnInstance : function()
    {
      if (!this._instance) {
        this._instance = new this;
      }

      /*
      if (this._instance.debug) {
        this._instance.debug("Created...");
      } */

      return this._instance;
    },


    /**
     * Simply return 0.
     *
     * @type static
     * @return {Number} Always returns 0.
     */
    returnZero : function() {
      return 0;
    },


    /**
     * Simply return a negative index (-1).
     *
     * @type static
     * @return {Number} Always returns -1.
     */
    returnNegativeIndex : function() {
      return -1;
    }
  }
});
