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
     * Fabian Jakobs (fjakobs)
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * Managed wrapper for the HTML Flash tag.
 */
qx.Class.define("qx.html.Flash",
{
  extend : qx.html.Element,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  /**
   * Default constructor
   */
  construct : function()
  {
    this.base(arguments);

    this.__source = "";
    this.__id = "";
    this.__params = {};
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** {String} The URL of the Flash movie. */
    __source : null,

    /** {String} The unique Flash movie id. */
    __id : null,

    /** {Map} The attributes for the Flash movie. */
    __params : null,

    /** {Map} The <code>FlashVars</code> to pass variables to the Flash movie. */
    __variables : null,

    /** {qx.bom.Flash} The DOM Flash element. */
    __flash : null,

    // overridden
    _createDomElement : function()
    {
      return qx.bom.Element.create("div");
    },

    /**
     * Creates the DOM Flash movie with all nedded attributes and
     * <code>FlashVars</code>.
     */
    createFlash : function()
    {
      var element = this.getDomElement();

      this.__flash = qx.bom.Flash.create(element, this.__source, this.__id,
        this.__variables, this.__params
      );
    },

    /**
     * Set the URL from the Flash movie to display.
     *
     * @param value {String} URL from the Flash movie.
     */
    setSource : function(value)
    {
      if (this.__flash) {
        throw new Error("The source cannot be modified after initial creation");
      }

      this.__source = value;
    },

    /**
     * Set the URL from the Flash movie to display.
     *
     * @param value {String} URL from the Flash movie.
     */
    setId : function(value)
    {
      if (this.__flash) {
        throw new Error("The id cannot be modified after initial creation");
      }

      this.__id = value;
    },

    /**
     * Set the <code>FlashVars</code> to pass variables to the Flash movie.
     *
     * @param value {Map} Map with key/value pairs for passing
     *    <code>FlashVars</code>
     */
    setVariables : function(value)
    {
      if (this.__flash) {
        throw new Error("The variables cannot be modified after initial creation");
      }

      this.__variables = value;
    },

    /**
     * Set the param for the Flash DOM element, also called attribute.
     *
     * @param key {String} Key name.
     * @param value {String|null} Value or <code>null</code> to remove param
     */
    setParam : function(key, value)
    {
      if (this.__flash) {
        throw new Error("The " + key + " cannot be modified after initial creation");
      }

      if (value) {
        this.__params[key] = value;
      } else {
        delete this.__params[key];
      }
    },

    /**
     * Return the created DOM Flash movie.
     *
     * @return {Element|null} The DOM Flash element, otherwise <code>null</code>.
     */
    getFlashElement : function()
    {
      return this.__flash;
    }
  },


  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    qx.bom.Flash.destroy(this.__flash);
    this._disposeFields("this.__flash");
  }
});
