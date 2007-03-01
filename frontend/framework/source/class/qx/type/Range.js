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
 * This manager is used by all objects which needs ranges like qx.ui.form.Spinner, ...
 */
qx.Class.define("qx.type.Range",
{
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    "change" : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /** current value of the Range object */
    value :
    {
      type         : "number",
      defaultValue : 0,
      _legacy      : true
    },

    /** minimal value of the Range object */
    min :
    {
      type         : "number",
      defaultValue : 0,
      _legacy      : true
    },

    /** maximal value of the Range object */
    max :
    {
      type         : "number",
      defaultValue : 100,
      _legacy      : true
    },

    /** Step size for increments/decrements of the value property */
    step :
    {
      type         : "number",
      defaultValue : 1,
      _legacy      : true
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
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @return {call} TODOC
     */
    _checkValue : function(propValue) {
      return Math.max(this.getMin(), Math.min(this.getMax(), Math.floor(propValue)));
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyValue : function(propValue, propOldValue, propData)
    {
      if (this.hasEventListeners("change")) {
        this.dispatchEvent(new qx.event.type.Event("change"), true);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @return {call} TODOC
     */
    _checkMax : function(propValue) {
      return Math.floor(propValue);
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyMax : function(propValue, propOldValue, propData)
    {
      this.setValue(Math.min(this.getValue(), propValue));

      if (this.hasEventListeners("change")) {
        this.dispatchEvent(new qx.event.type.Event("change"), true);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @return {call} TODOC
     */
    _checkMin : function(propValue) {
      return Math.floor(propValue);
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyMin : function(propValue, propOldValue, propData)
    {
      this.setValue(Math.max(this.getValue(), propValue));

      if (this.hasEventListeners("change")) {
        this.dispatchEvent(new qx.event.type.Event("change"), true);
      }

      return true;
    }
  }
});
