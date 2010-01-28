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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */


/**
 * A generic singleton that fires an "interval" event all 100 miliseconds. It
 * can be used whenever one needs to run code periodically. The main purpose of
 * this class is reduce the number of timers.
 */

qx.Class.define("qx.event.Idle",
{
  extend : qx.core.Object,
  type : "singleton",

  construct : function()
  {
    this.base(arguments);

    var timer = new qx.event.Timer(this.getTimeoutInterval());
    timer.addListener("interval", this._onInterval, this);
    timer.start();

    this.__timer = timer;
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** This event if fired each time the interval time has elapsed */
    "interval" : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Interval for the timer, which periodically fires the "interval" event,
     * in milliseconds.
     */
    timeoutInterval :
    {
      check: "Number",
      init : 100,
      apply : "_applyTimeoutInterval"
    }
  },



  members :
  {

    __timer : null,

    // property apply
    _applyTimeoutInterval : function(value) {
      this.__timer.setInterval(value);
    },

    /**
     * Fires an "interval" event
     */
    _onInterval : function() {
      this.fireEvent("interval");
    }

  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.__timer) {
      this.__timer.stop();
    }

    this.__timer = null;
  }

});