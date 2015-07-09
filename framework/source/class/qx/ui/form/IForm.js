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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Form interface for all form widgets. It includes the API for enabled,
 * required and valid states.
 */
qx.Interface.define("qx.ui.form.IForm",
{
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the enabled state was modified */
    "changeEnabled" : "qx.event.type.Data",

    /** Fired when the valid state was modified */
    "changeValid" : "qx.event.type.Data",

    /** Fired when the invalidMessage was modified */
    "changeInvalidMessage" : "qx.event.type.Data",

    /** Fired when the required was modified */
    "changeRequired" : "qx.event.type.Data"
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
     * Set the enabled state of the widget.
     *
     * @param enabled {Boolean} The enabled state.
     */
    setEnabled : function(enabled) {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertBoolean(enabled);
    },


    /**
     * Return the current set enabled state.
     *
     * @return {Boolean} If the widget is enabled.
     */
    getEnabled : function() {},


    /*
    ---------------------------------------------------------------------------
      REQUIRED PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the required state of a widget.
     *
     * @param required {Boolean} A flag signaling if the widget is required.
     */
    setRequired : function(required) {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertBoolean(required);
    },


    /**
     * Return the current required state of the widget.
     *
     * @return {Boolean} True, if the widget is required.
     */
    getRequired : function() {},


    /*
    ---------------------------------------------------------------------------
      VALID PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the valid state of the widget.
     *
     * @param valid {Boolean} The valid state of the widget.
     */
    setValid : function(valid) {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertBoolean(valid);
    },


    /**
     * Returns the valid state of the widget.
     *
     * @return {Boolean} If the state of the widget is valid.
     */
    getValid : function() {},


    /*
    ---------------------------------------------------------------------------
      INVALID MESSAGE PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the invalid message of the widget.
     *
     * @param message {String} The invalid message.
     */
    setInvalidMessage : function(message) {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertString(message);
    },


    /**
     * Returns the invalid message of the widget.
     *
     * @return {String} The current set message.
     */
    getInvalidMessage : function() {},



    /*
    ---------------------------------------------------------------------------
      REQUIRED INVALID MESSAGE PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the invalid message if required of the widget.
     *
     * @param message {String} The invalid message.
     */
    setRequiredInvalidMessage : function(message) {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertString(message);
    },


    /**
     * Returns the invalid message if required of the widget.
     *
     * @return {String} The current set message.
     */
    getRequiredInvalidMessage : function() {}
  }
});
