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

/**
 * 
 */
qx.Class.define("qx.ui.menu.SliderButton",
{
  extend : qx.ui.basic.Atom,

  construct : function()
  {
    this.base(arguments);
    
    this.addListener("mouseover", this._onMouseOver, this);
    this.addListener("mouseout", this._onMouseOut, this);
    
    this.__timer = new qx.event.AcceleratingTimer();
    this.__timer.addListener("interval", this._onInterval, this);
  },


  events :
  {
    "execute" : "qx.event.type.Event"
  },
  
  
  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "menu-slider-button"
    },
    
    // overridden
    show : 
    {
      refine : true,
      init : "icon" 
    },
    
    // overridden
    center : {
      refine : true,
      init : true
    },
    
    /**
     * Interval used after the first run of the timer. Usually a smaller value
     * than the "firstInterval" property value to get a faster reaction.
     */
    interval :
    {
      check : "Integer",
      init  : 80
    },

    /**
     * Interval used for the first run of the timer. Usually a greater value
     * than the "interval" property value to a little delayed reaction at the first
     * time.
     */
    firstInterval :
    {
      check : "Integer",
      init  : 200
    },
    
    /** This configures the minimum value for the timer interval. */
    minTimer :
    {
      check : "Integer",
      init  : 20
    },

    /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
    timerDecrease :
    {
      check : "Integer",
      init  : 2
    }    
  },


  members :
  {
    __timer : null,
    
    
    _onMouseOver : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }
      
      this.__timer.set({
        interval: this.getInterval(),
        firstInterval: this.getFirstInterval(),
        minimum: this.getMinTimer(),
        decrease: this.getTimerDecrease()
      }).start();
      
      this.addState("hovered");
    },
    
    
    _onMouseOut : function(e)
    {
      this.__timer.stop();
      this.removeState("hovered");

      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }
    },
    
    
    _onInterval : function()
    {
      if (this.isEnabled())
      {
        this.fireEvent("execute");
      } else {
        this.__timer.stop();
      }
    }
  },
  
  
  destruct : function() {
    this._disposeObjects("__timer");
  }  
});
