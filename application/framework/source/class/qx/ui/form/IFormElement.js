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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Each object, which is in some way usable in a form or as a form element
 * should implement this interface.
 */
qx.Interface.define("qx.ui.form.IFormElement",
{
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the value was modified */
    "changeValue" : "qx.event.type.Data",

    /** Fired when the name attribute was modified */
    "changeName" : "qx.event.type.Data",

    /** Fired when the element was enabled or disabled */
    "changeEnabled" : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      ENABLED PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Set whether the element is enabled
     *
     * @param value {Boolean} whether the element should be enabled
     */
    setEnabled : function(value) {
      this.assertType(value, "boolean");
    },


    /**
     * Get whether the element is enabled
     *
     * @return {Boolean} whether the element is enabled
     */
    getEnabled : function() {},



    /*
    ---------------------------------------------------------------------------
      NAME PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Set the element's name
     *
     * @param value {Boolean} The new name of the element
     */
    setName : function(value) {
      this.assertType(value, "string");
    },


    /**
     * Get the name of the element
     *
     * @return {Boolean} the name of the element
     */
    getName : function() {},




    /*
    ---------------------------------------------------------------------------
      VALUE PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the element's string value
     *
     * @param value {String} The new value of the element
     * @return {var} the value
     */
    setValue : function(value) {
      this.assertType(value, "string");
    },


    /**
     * The element's user set value
     *
     * @return {var} the value
     */
    getValue : function() {}
  }
});
