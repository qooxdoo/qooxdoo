/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Mustafa Sak (msak)

************************************************************************ */

/**
 * This mixin provides scrolling for scroller widgets.
 */
qx.Mixin.define("qx.ui.core.scroll.MTouchScroll",
{
  construct : function()
  {

    // touch move listener for touch scrolling
    this.addListener("touchmove", this._onTouchMove, this);

    // reset the delta on every touch session
    this.addListener("touchstart", this._onTouchStart, this);

    this.addListener("touchend", this._onTouchEnd, this, true);


    this.__old = {};
    this.__impulseTimerId = {};
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __momentum : false,
    __preventNextTouchEndEvent : false,
    __impulseTimerId : null,
    __old : null,



    /**
     * Returns true if touch momentum is currently on progress.
     *
     * @return {Boolean} true if in momentum
     */
    inTouchMomentum : function()
    {
      return this.__momentum;
    },


    /**
     * Handler for <code>touchstart</code> event. Clears timers and flags.
     *
     * @param e {qx.event.type.Touch} the touch event
     */
    _onTouchStart : function(e)
    {
      if(this.__impulseTimerId) {
        clearTimeout(this.__impulseTimerId.x);
        clearTimeout(this.__impulseTimerId.y);
      }

      this.__old = {"x": 0, "y": 0};
      if  (this.__momentum){
        this.__preventNextTouchEndEvent = true;
        this.__momentum = false;
      }
    },


    /**
     * Handler for touchend event. Stops event propagation if needed.
     *
     * @param e {qx.event.type.Touch} the touch event
     */
    _onTouchEnd : function(e)
    {
      if(this.__preventNextTouchEndEvent){
        this.__preventNextTouchEndEvent = false;
        e.stop();
      }
    },



    /**
     * Event handler for the touch move.
     *
     * @param e {qx.event.type.Touch} The touch event
     */
    _onTouchMove : function(e)
    {
      this._onTouchMoveDirectional("x", e);
      this._onTouchMoveDirectional("y", e);

      this.__momentum = true;
      // Stop bubbling and native event
      e.stop();
    },


    /**
     * Touch move handler for one direction.
     *
     * @param dir {String} Either 'x' or 'y'
     * @param e {qx.event.type.Touch} The touch event
     */
    _onTouchMoveDirectional : function(dir, e)
    {
      var docDir = (dir == "x" ? "Left" : "Top");

      // current scrollbar
      var scrollbar = this.getChildControl("scrollbar-" + dir, true);
      var show = this._isChildControlVisible("scrollbar-" + dir);

      if (show && scrollbar) {
        var delta = null;

        // get the delta for the current direction
        if(this.__old[dir] == 0) {
          delta = 0;
        } else {
          delta = -(e["getDocument" + docDir]() - this.__old[dir]);
        }

        // save the old value for the current direction
        this.__old[dir] = e["getDocument" + docDir]();

        scrollbar.scrollBy(delta);

        // if we have an old timeout for the current direction, clear it
        if (this.__impulseTimerId[dir]) {
          clearTimeout(this.__impulseTimerId[dir]);
          this.__impulseTimerId[dir] = null;
        }

        // set up a new timer for the current direction
        this.__impulseTimerId[dir] =
          setTimeout(qx.lang.Function.bind(function(delta) {
            this.__handleScrollImpulse(delta, dir);
          }, this, delta), 100);
      }
    },


    /**
     * Helper for momentum scrolling.
     *
     * @param delta {Number} The delta from the last scrolling.
     * @param dir {String} Direction of the scrollbar ('x' or 'y').
     */
    __handleScrollImpulse : function(delta, dir)
    {
      // delete the old timer id
      this.__impulseTimerId[dir] = null;

      // do nothing if the scrollbar is not visible or we don't need to scroll
      var show = this._isChildControlVisible("scrollbar-" + dir);
      if (delta == 0 || !show) {
        this.__momentum = false;
        return;
      }

      // linear momentum calculation
      if (delta > 0) {
        delta = Math.max(0, delta - 3);
      } else {
        delta = Math.min(0, delta + 3);
      }

      // set up a new timer with the new delta
      this.__impulseTimerId[dir] =
        setTimeout(qx.lang.Function.bind(function(delta, dir) {
          this.__handleScrollImpulse(delta, dir);
        }, this, delta, dir), 10);

      // scroll the desired new delta
      var scrollbar = this.getChildControl("scrollbar-" + dir, true);
      scrollbar.scrollBy(delta);
    }
  },


  destruct : function()
  {
    clearTimeout(this.__impulseTimerId.x);
    clearTimeout(this.__impulseTimerId.y);

    this.__impulseTimerId = this.__old = this.__momentum = null;
  }
});
