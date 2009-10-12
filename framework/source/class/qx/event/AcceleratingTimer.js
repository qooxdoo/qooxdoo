/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.event.AcceleratingTimer",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);
    
    this.__timer = new qx.event.Timer(this.getInterval());
    this.__timer.addListener("interval", this._onInterval, this);
  },


  events :
  {
    /** This event if fired each time the interval time has elapsed */
    "interval" : "qx.event.type.Event"
  },


  properties :
  {
    /**
     * Interval used after the first run of the timer. Usually a smaller value
     * than the "firstInterval" property value to get a faster reaction.
     */
    interval :
    {
      check : "Integer",
      init  : 100
    },

    /**
     * Interval used for the first run of the timer. Usually a greater value
     * than the "interval" property value to a little delayed reaction at the first
     * time.
     */
    firstInterval :
    {
      check : "Integer",
      init  : 500
    },

    /** This configures the minimum value for the timer interval. */
    minimum :
    {
      check : "Integer",
      init  : 20
    },

    /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
    decrease :
    {
      check : "Integer",
      init  : 2
    }    
  },


  members :
  {
    __currentInterval : null,

    start : function()
    {
      this.__timer.setInterval(this.getFirstInterval());
      this.__timer.start();
    },
    
    
    stop : function() 
    {
      this.__timer.stop();
      this.__currentInterval = null;
    },
    
    
    _onInterval : function()
    {
      this.__timer.stop();
      
      if (this.__currentInterval == null) {
        this.__currentInterval = this.getInterval();
      }
      
      this.__currentInterval = Math.max(
        this.getMinimum(), 
        this.__currentInterval - this.getDecrease()
      );
      
      this.__timer.setInterval(this.__currentInterval);
      this.__timer.start();
      
      this.fireEvent("interval");
    }    
  },
  
  destruct : function() {
    this._disposeObjects("__timer");
  }
});
