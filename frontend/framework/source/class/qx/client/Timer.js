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
 * Global timer support. Simplifies javascript intervals for objects.
 */
qx.Clazz.define("qx.client.Timer",
{
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(interval)
  {
    this.base(arguments);

    this.setEnabled(false);

    if (interval != null) {
      this.setInterval(interval);
    }

    this.__oninterval = qx.lang.Function.bind(this._oninterval, this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {
    "interval" : "qx.event.type.Event"
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * TODOC
     *
     * @type static
     * @param func {Function} TODOC
     * @param obj {Object} TODOC
     * @param timeout {Number} TODOC
     * @return {void}
     */
    once : function(func, obj, timeout)
    {
      // Create time instance
      var timer = new qx.client.Timer(timeout);

      // Add event listener to interval
      timer.addEventListener("interval", function(e)
      {
        func.call(obj, e);
        timer.dispose();

        obj = null;
      },
      obj);

      // Directly start timer
      timer.start();
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    interval :
    {
      type         : "number",
      defaultValue : 1000,
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
    __intervalHandler : null,




    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifyEnabled : function(propValue, propOldValue, propData)
    {
      if (propOldValue)
      {
        window.clearInterval(this.__intervalHandler);
        this.__intervalHandler = null;
      }
      else if (propValue)
      {
        this.__intervalHandler = window.setInterval(this.__oninterval, this.getInterval());
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      USER-ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    start : function() {
      this.setEnabled(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @param interval {var} TODOC
     * @return {void}
     */
    startWith : function(interval)
    {
      this.setInterval(interval);
      this.start();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    stop : function() {
      this.setEnabled(false);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    restart : function()
    {
      this.stop();
      this.start();
    },


    /**
     * TODOC
     *
     * @type member
     * @param interval {var} TODOC
     * @return {void}
     */
    restartWith : function(interval)
    {
      this.stop();
      this.startWith(interval);
    },




    /*
    ---------------------------------------------------------------------------
      EVENT-MAPPER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _oninterval : function()
    {
      if (this.getEnabled()) {
        this.createDispatchEvent("interval");
      }
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      // Stop interval
      this.stop();

      // Clear handle
      if (this.__intervalHandler)
      {
        window.clearInterval(this.__intervalHandler);
        this.__intervalHandler = null;
      }

      // Clear object wrapper function
      this.__oninterval = null;

      // Call qx.core.Target to do the other dispose work
      return this.base(arguments);
    }
  }
});
