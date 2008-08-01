/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/**
 * A scroll bar.
 */
qx.Class.define("qx.legacy.ui.basic.ScrollBar",
{
  extend : qx.legacy.ui.layout.CanvasLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param horizontal {Boolean ? false} whether the scroll bar should be
   *    horizontal. If false it will be vertical.
   */
  construct : function(horizontal)
  {
    this.base(arguments, horizontal ? "horizontal" : "vertical");

    this._horizontal = (horizontal == true);

    this._scrollBar = new qx.legacy.ui.basic.ScrollArea;

    if (qx.core.Variant.isSet("qx.client", "gecko"))
    {
      // NOTE: We have to force not using position:absolute, because this causes
      //     strange looking scrollbars in some cases (e.g. in Firefox under
      //     Linux the horizontal scrollbar is too high)
      this._scrollBar.setStyleProperty("position", "");
    }

    this._scrollBar.setOverflow(horizontal ? "scrollX" : "scrollY");
    this._scrollBar.addListener("scroll", this._onscroll, this);

    this._scrollContent = new qx.legacy.ui.basic.Terminator;

    if (qx.core.Variant.isSet("qx.client", "gecko")) {
      this._scrollContent.setStyleProperty("position", "");
    }

    this._scrollBar.add(this._scrollContent);

    if (this._horizontal)
    {
      this._scrollContent.setHeight(5);
      this._scrollBar.setWidth("100%");
      this._scrollBar.setHeight(this._getScrollBarWidth());

      // IE needs that the scrollbar element has a width of +1
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        this.setHeight(this._getScrollBarWidth());
        this.setOverflow("hidden");
        this._scrollBar.setHeight(this._getScrollBarWidth() + 1);
        this._scrollBar.setTop(-1);
      }
    }
    else
    {
      this._scrollContent.setWidth(5);
      this._scrollBar.setHeight("100%");
      this._scrollBar.setWidth(this._getScrollBarWidth());

      // IE needs that the scrollbar element has a width of +1
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        this.setWidth(this._getScrollBarWidth());
        this.setOverflow("hidden");
        this._scrollBar.setWidth(this._getScrollBarWidth() + 1);
        this._scrollBar.setLeft(-1);
      }
    }

    this.add(this._scrollBar);

    this._blocker = new qx.legacy.ui.basic.Terminator();
    this._blocker.set({
      left : 0,
      top : 0,
      height : "100%",
      width : "100%",
      display : !this.getEnabled()
    });
    this._blocker.setAppearance( "scrollbar-blocker" );
    this.add(this._blocker);


    this.setMaximum(0);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * The delay when to update the scroll bar value after a scroll event if
     * {@link #mergeEvents} is true (in milliseconds). All scroll events that arrive
     * in shorter time will be merged.
     */
    EVENT_DELAY : 250
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The current value of the scroll bar. This value is between 0 and
     * (maxium - size), where size is the width of a horizontal resp. the height of
     * a vertical scroll bar in pixels.
     *
     * @see #maximum
     */
    value :
    {
      check : "Number",
      init : 0,
      apply : "_applyValue",
      event : "changeValue",
      transform : "_checkValue"
    },


    /**
     * The maximum value of the scroll bar. Note that the size of the scroll bar is
     * substracted.
     *
     * @see #value
     */
    maximum :
    {
      check : "Integer",
      apply : "_applyMaximum"
    },


    /**
     * Whether to merge consecutive scroll event. If true, events will be collected
     * until the user stops scrolling, so the scroll bar itself will move smoothly
     * and the scrolled content will update asynchroniously.
     */
    mergeEvents :
    {
      check : "Boolean",
      init : false
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
     * Limit the value to the allowed range of the scroll bar.
     *
     * @param value {Number} Current value
     * @return {Number} Limited value.
     */
    _checkValue : function(value)
    {
      var innerSize = !this.getElement() ? 0 : (this._horizontal ? this.getInnerWidth() : this.getInnerHeight());

      // NOTE: We can't use Number.limit here because our maximum may get negative
      //       (when the scrollbar isn't needed). In this case Number.limit returns
      //       this negative maximum instead of 0. But we need that the minimum is
      //       stronger than the maximum.
      //       -> We use Math.max and Math.min
      return Math.max(0, Math.min(this.getMaximum() - innerSize, value));
    },


    _applyValue : function(value, old)
    {
      if (!this._internalValueChange && this._isCreated) {
        this._positionKnob(value);
      }
    },


    _applyMaximum : function(value, old)
    {
      if (this._horizontal) {
        this._scrollContent.setWidth(value);
      } else {
        this._scrollContent.setHeight(value);
      }

      // recheck the value
      this.setValue(this._checkValue(this.getValue()));
    },


    // property modifier
    _applyVisibility : function(value, old)
    {
      if (!value) {
        this._positionKnob(0);
      } else {
        this._positionKnob(this.getValue());
      }

      return this.base(arguments, value, old);
    },


    /**
     * overridden
     * @return {Integer}
     */
    _computePreferredInnerWidth : function() {
      return this._horizontal ? 0 : this._getScrollBarWidth();
    },


    /**
     * overridden
     * @return {Integer}
     */
    _computePreferredInnerHeight : function() {
      return this._horizontal ? this._getScrollBarWidth() : 0;
    },


    _applyEnabled : function(isEnabled)
    {
      this.base(arguments);
      this._blocker.setDisplay(!this.getEnabled());
    },


    /**
     * Gets the width of vertical scroll bar.
     *
     * @return {Integer} the width in pixels.
     */
    _getScrollBarWidth : function()
    {
      // Auto-detect the scrollbar width
      if (qx.legacy.ui.basic.ScrollBar._scrollBarWidth == null)
      {
        var dummy = document.createElement("div");
        dummy.style.width = "100px";
        dummy.style.height = "100px";
        dummy.style.overflow = "scroll";
        dummy.style.visibility = "hidden";
        document.body.appendChild(dummy);
        qx.legacy.ui.basic.ScrollBar._scrollBarWidth = dummy.offsetWidth - dummy.clientWidth;
        document.body.removeChild(dummy);
      }

      return qx.legacy.ui.basic.ScrollBar._scrollBarWidth;
    },


    /**
     * Event handler. Called when the user scrolled.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onscroll : function(evt)
    {
      var value = this._horizontal ? this._scrollBar.getScrollLeft() : this._scrollBar.getScrollTop();

      if (this.getMergeEvents())
      {
        this._lastScrollEventValue = value;
        window.clearTimeout(this._setValueTimerId);
        var self = this;

        this._setValueTimerId = window.setTimeout(function()
        {
          self._internalValueChange = true;
          self.setValue(self._lastScrollEventValue);
          self._internalValueChange = false;
          qx.legacy.ui.core.Widget.flushGlobalQueues();
        },
        qx.legacy.ui.basic.ScrollBar.EVENT_DELAY);
      }
      else
      {
        this._internalValueChange = true;
        this.setValue(value);
        this._internalValueChange = false;
        qx.legacy.ui.core.Widget.flushGlobalQueues();
      }
    },


    /**
     * Positions the scroll bar knob at a certain value.
     *
     * @param value {Integer} The value where to postion the scroll bar.
     * @return {void}
     */
    _positionKnob : function(value)
    {
      if (this.isCreated())
      {
        if (this._horizontal) {
          this._scrollBar.setScrollLeft(value);
        } else {
          this._scrollBar.setScrollTop(value);
        }
      }
    },

    // overridden
    _afterAppear : function()
    {
      this.base(arguments);
      this._positionKnob(this.getValue());
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_scrollContent", "_scrollBar", "_blocker");
  }
});
