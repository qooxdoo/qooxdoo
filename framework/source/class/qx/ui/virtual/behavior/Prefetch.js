/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Behavior to support pre-rendering of invisible areas of a virtual scroller.
 * If applied to a scroller it will start a timer and increase the rendered area
 * of the scroller after a certain period of time. Subsequent scrolling will not
 * have to render this pre-computed area again.
 *
 */
qx.Class.define("qx.ui.virtual.behavior.Prefetch",
{
  extend : qx.core.Object,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param scroller {qx.ui.virtual.core.Scroller} The scroller to prefetch
   * @param settings {Map} This map contains minimum and maximum pixels to
   * prefetch near the view port.
   * <ul>
   *   <li>minLeft: minimum pixels to prefetch left to the view port</li>
   *   <li>maxLeft: maximum pixels to prefetch left to the view port</li>
   *   <li>minRight: minimum pixels to prefetch right to the view port</li>
   *   <li>maxRight: maximum pixels to prefetch right to the view port</li>
   *   <li>minAbove: minimum pixels to prefetch above the view port</li>
   *   <li>maxAbove: maximum pixels to prefetch above the view port</li>
   *   <li>minBelow: minimum pixels to prefetch below the view port</li>
   *   <li>maxBelow: maximum pixels to prefetch below the view port</li>
   * </ul>
   */

  construct : function(scroller, settings)
  {

    if (qx.core.Environment.get("qx.debug"))
    {
      this.assertObject(settings);
      this.assertPositiveInteger(settings.minLeft);
      this.assertPositiveInteger(settings.maxLeft);
      this.assertPositiveInteger(settings.minRight);
      this.assertPositiveInteger(settings.maxRight);
      this.assertPositiveInteger(settings.minAbove);
      this.assertPositiveInteger(settings.maxAbove);
      this.assertPositiveInteger(settings.minBelow);
      this.assertPositiveInteger(settings.maxBelow);
    }

    this.base(arguments);

    this.setPrefetchX(settings.minLeft, settings.maxLeft, settings.minRight, settings.maxRight);
    this.setPrefetchY(settings.minAbove, settings.maxAbove, settings.minBelow, settings.maxBelow);

    this.__timer = new qx.event.Timer(this.getInterval());
    this.__timer.addListener("interval", this._onInterval, this);

    if (scroller) {
      this.setScroller(scroller);
    }
  },


  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

   properties :
   {
    /** @type {qx.ui.virtual.core.Scroller} The scroller to prefetch */
     scroller :
     {
       check : "qx.ui.virtual.core.Scroller",
       nullable : true,
       init : null,
       apply : "_applyScroller"
     },

     /** @type {Integer} Polling interval */
     interval :
     {
       check : "Integer",
       init : 200,
       apply : "_applyInterval"
     }
   },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __prefetchX : null,
    __prefetchY : null,
    __timer : null,
    __onScrollXId : null,
    __onScrollYId : null,

    /**
     * Configure horizontal prefetching
     *
     * @param minLeft {Integer} minimum pixels to prefetch left to the view port
     * @param maxLeft {Integer} maximum pixels to prefetch left to the view port
     * @param minRight {Integer} minimum pixels to prefetch right to the view port
     * @param maxRight {Integer} maximum pixels to prefetch right to the view port
     */
    setPrefetchX : function(minLeft, maxLeft, minRight, maxRight) {
      this.__prefetchX = [minLeft, maxLeft, minRight, maxRight];
    },


    /**
     * Configure vertical prefetching
     *
     * @param minAbove {Integer} minimum pixels to prefetch above the view port
     * @param maxAbove {Integer} maximum pixels to prefetch above the view port
     * @param minBelow {Integer} minimum pixels to prefetch below the view port
     * @param maxBelow {Integer} maximum pixels to prefetch below the view port
     */
    setPrefetchY : function(minAbove, maxAbove, minBelow, maxBelow) {
      this.__prefetchY = [minAbove, maxAbove, minBelow, maxBelow];
    },


    /**
     * Update prefetching
     */
    _onInterval : function()
    {
      var px = this.__prefetchX;
      if (px[1] && px[3])
      {
        this.getScroller().getPane().prefetchX(px[0], px[1], px[2], px[3]);
        qx.ui.core.queue.Manager.flush();
      }

      var py = this.__prefetchY;
      if (py[1] && py[3])
      {
        this.getScroller().getPane().prefetchY(py[0], py[1], py[2], py[3]);
        qx.ui.core.queue.Manager.flush();
      }
    },


    // property apply
    _applyScroller : function(value, old)
    {
      if (old)
      {
        if (this.__onScrollXId) {
          old.getChildControl("scrollbar-x").removeListenerById(this.__onScrollXId);
        }
        if (this.__onScrollYId) {
          old.getChildControl("scrollbar-y").removeListenerById(this.__onScrollYId);
        }
      }

      if (value)
      {
        if (!value.getContentElement().getDomElement())
        {
          this.__timer.stop();
          value.addListenerOnce("appear", this.__timer.start, this.__timer);
        }
        else
        {
          this.__timer.restart();
        }

//        if (value.hasChildControl("scrollbar-x"))
//        {
          this.__onScrollXId = value.getChildControl("scrollbar-x").addListener(
            "scroll",
            this.__timer.restart,
            this.__timer
          );
//        }
//        if (value.hasChildControl("scrollbar-y"))
//        {
          this.__onScrollYId = value.getChildControl("scrollbar-y").addListener(
            "scroll",
            this.__timer.restart,
            this.__timer
          );
//        }

      }
      else
      {
        this.__timer.stop();
      }
    },


    // property apply
    _applyInterval : function(value, old) {
      this.__timer.setInterval(value);
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    this.setScroller(null);
    this.__prefetchX = this.__prefetchY = null;
    this._disposeObjects("__timer");
  }
});
