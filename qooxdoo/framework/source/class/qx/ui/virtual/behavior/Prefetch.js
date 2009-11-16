/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * EXPERIMENTAL!
 */
qx.Class.define("qx.ui.virtual.behavior.Prefetch",
{
  extend : qx.core.Object,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(
    scroller,
    minLeft, maxLeft, minRight, maxRight,
    minAbove, maxAbove, minBelow, maxBelow
  )
  {
    this.base(arguments);

    this.setPrefetchX(minLeft, maxLeft, minRight, maxRight);
    this.setPrefetchY(minAbove, maxAbove, minBelow, maxBelow);

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
     scroller :
     {
       check : "qx.ui.virtual.core.Scroller",
       nullable : true,
       init : null,
       apply : "_applyScroller"
     },

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

     setPrefetchX : function(minLeft, maxLeft, minRight, maxRight) {
       this.__prefetchX = [minLeft, maxLeft, minRight, maxRight];
     },


     setPrefetchY : function(minAbove, maxAbove, minBelow, maxBelow) {
       this.__prefetchY = [minAbove, maxAbove, minBelow, maxBelow];
     },


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
        if (!value.getContainerElement().getDomElement())
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
