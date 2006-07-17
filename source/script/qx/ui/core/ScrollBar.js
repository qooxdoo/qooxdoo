/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>
     * Til Schneider (til132)
       <tilman dot schneider at stz-ida dot de>

************************************************************************ */

/* ************************************************************************

#module(table)
#require(qx.ui.layout.BoxLayout)
#require(qx.constant.Type)
#use(qx.constant.Layout)
#use(qx.ui.layout.CanvasLayout)
#use(qx.sys.Client)
#use(qx.constant.Style)

************************************************************************ */

/**
 * A scroll bar.
 *
 * @param horizontal {boolean,false} whether the scroll bar should be
 *    horizontal. If false it will be vertical.
 */
qx.OO.defineClass("qx.ui.core.ScrollBar", qx.ui.layout.BoxLayout,
function(horizontal) {
  qx.ui.layout.BoxLayout.call(this, horizontal ? qx.constant.Layout.ORIENTATION_HORIZONTAL : qx.constant.Layout.ORIENTATION_VERTICAL);

  this._horizontal = (horizontal == true);

  this._scrollBar = new qx.ui.layout.CanvasLayout;
  if (qx.sys.Client.isGecko()) {
    // NOTE: We have to force not using position:absolute, because this causes
    //     strange looking scrollbars in some cases (e.g. in Firefox under
    //     Linux the horizontal scrollbar is too high)
    this._scrollBar.setStyleProperty("position", "");
  }
  this._scrollBar.setOverflow(horizontal ? qx.constant.Style.OVERFLOW_HORIZONTAL : qx.constant.Style.OVERFLOW_VERTICAL);
  this._scrollBar.enableInlineEvent(qx.constant.Event.SCROLL);
  this._scrollBar.addEventListener(qx.constant.Event.SCROLL, this._onscroll, this);

  this._scrollContent = new qx.ui.basic.Terminator;
  if (qx.sys.Client.isGecko()) {
    this._scrollContent.setStyleProperty("position", "");
  }
  this._scrollBar.add(this._scrollContent);

  if (this._horizontal) {
    this._scrollContent.setHeight(5);
    this._scrollBar.setWidth("100%");
    this._scrollBar.setHeight(this._getScrollBarWidth());
  } else {
    this._scrollContent.setWidth(5);
    this._scrollBar.setHeight("100%");
    this._scrollBar.setWidth(this._getScrollBarWidth());
  }

  this.add(this._scrollBar);

  this.setMaximum(0);
});

/**
 * The current value of the scroll bar. This value is between 0 and
 * (maxium - size), where size is the width of a horizontal resp. the height of
 * a vertical scroll bar in pixels.
 *
 * @see #maximum
 */
qx.OO.addProperty({ name:"value", type:qx.constant.Type.NUMBER, defaultValue:0, allowNull:false });

/**
 * The maximum value of the scroll bar. Note that the size of the scroll bar is
 * substracted.
 *
 * @see #value
 */
qx.OO.addProperty({ name:"maximum", type:qx.constant.Type.NUMBER, allowNull:false });

/**
 * Whether to merge consecutive scroll event. If true, events will be collected
 * until the user stops scrolling, so the scroll bar itself will move smoothly
 * and the scrolled content will update asynchroniously.
 */
qx.OO.addProperty({ name:"mergeEvents", type:qx.constant.Type.BOOLEAN, defaultValue:false, allowNull:false });


// property checker
qx.Proto._checkValue = function(propValue, propData) {
  var innerSize = (this.getParent() == null) ? 0 :
    (this._horizontal ? this.getInnerWidth() : this.getInnerHeight());
  return qx.lang.Number.limit(propValue, 0, this.getMaximum() - innerSize);
}


// property modifier
qx.Proto._modifyValue = function(propValue, propOldValue, propData) {
  if (! this._internalValueChange && this._isCreated) {
    this._positionKnob(propValue);
  }
  return true;
}


// property modifier
qx.Proto._modifyMaximum = function(propValue, propOldValue, propData) {
  if (this._horizontal) {
    this._scrollContent.setWidth(propValue);
  } else {
    this._scrollContent.setHeight(propValue);
  }

  // recheck the value
  this.setValue(this._checkValue(this.getValue()));

  return true;
}


// overridden
qx.Proto._computePreferredInnerWidth = function() {
  return this._horizontal ? 0 : this._getScrollBarWidth();
}


// overridden
qx.Proto._computePreferredInnerHeight = function() {
  return this._horizontal ? this._getScrollBarWidth() : 0;
}


/**
 * Gets the width of vertical scroll bar.
 *
 * @return {int} the width in pixels.
 */
qx.Proto._getScrollBarWidth = function() {
  // Auto-detect the scrollbar width
  if (qx.ui.core.ScrollBar._scrollBarWidth == null) {
    var dummy = document.createElement("div");
    dummy.style.width = "100px";
    dummy.style.height = "100px";
    dummy.style.overflow = "scroll";
    dummy.style.visibility = "hidden";
    document.body.appendChild(dummy);
    qx.ui.core.ScrollBar._scrollBarWidth = dummy.offsetWidth - dummy.clientWidth;
    document.body.removeChild(dummy);
  }
  return qx.ui.core.ScrollBar._scrollBarWidth;
}


/**
 * Event handler. Called when the user scrolled.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onscroll = function(evt) {
  var value = this._horizontal ? this._scrollBar.getScrollLeft() : this._scrollBar.getScrollTop();
  if (this.getMergeEvents()) {
    this._lastScrollEventValue = value;
    window.clearTimeout(this._setValueTimerId);
    var self = this;
    this._setValueTimerId = window.setTimeout(function() {
      self._internalValueChange = true;
      self.setValue(self._lastScrollEventValue);
      self._internalValueChange = false;
      qx.ui.core.Widget.flushGlobalQueues();
    }, qx.ui.core.ScrollBar.EVENT_DELAY);
  } else {
    this._internalValueChange = true;
    this.setValue(value);
    this._internalValueChange = false;
    qx.ui.core.Widget.flushGlobalQueues();
  }
}


/**
 * Positions the scroll bar knob at a certain value.
 *
 * @param value {int} The value where to postion the scroll bar.
 */
qx.Proto._positionKnob = function(value) {
  if (this._horizontal) {
    this._scrollBar.setScrollLeft(value);
  } else {
    this._scrollBar.setScrollTop(value);
  }
}


// overridden
qx.Proto._afterAppear = function() {
  qx.ui.layout.BoxLayout.prototype._afterAppear.call(this);

  //this.debug("Setting to value: " + this.getValue());
  this._positionKnob(this.getValue());
}


// overridden
qx.Proto.dispose = function() {
  if (this.getDisposed()) {
    return;
  }

  if (this._scrollContent) {
    this._scrollContent.dispose();
    this._scrollContent = null;
  }

  return qx.ui.layout.BoxLayout.prototype.dispose.call(this);
}


/**
 * The delay when to update the scroll bar value after a scroll event if
 * {@link #mergeEvents} is true (in milliseconds). All scroll events that arrive
 * in shorter time will be merged.
 */
qx.Class.EVENT_DELAY = 250;
