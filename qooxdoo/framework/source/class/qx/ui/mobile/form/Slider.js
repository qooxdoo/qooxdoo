/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Class.define("qx.ui.mobile.form.Slider",
{
  extend : qx.ui.mobile.core.Widget,

  construct : function()
  {
    this.base(arguments);
    this._registerEventListener();
  },


  properties :
  {
    cssClass :
    {
      refine : true,
      init : "slider"
    },


    value :
    {
      check : "Integer",
      init : 0,
      apply : "_updateKnobPosition",
      event : "changeValue"
    },


    minimum :
    {
      check : "Integer",
      init : 0,
      apply : "_updateKnobPosition"
    },


    maximum :
    {
      check : "Integer",
      init : 100,
      apply : "_updateKnobPosition"
    },


    step :
    {
      check : "Integer",
      init : 1
    }
  },


  members :
  {
    _isMovingKnob : false,
    _knobElement : null,
    _knobWidth : null,
    _containerElementWidth : null,
    _containerElementLeft : null,


    nextValue : function() {
       this.setValue(this.getValue() + this.getStep());
    },


    previousValue : function() {
       this.setValue(this.getValue() - this.getStep());
    },


    _createContainerElement : function()
    {
      var container = this.base(arguments);
      container.appendChild(this._createKnobElement());
      return container;
    },


    _createKnobElement : function()
    {
      return qx.bom.Element.create("div");
    },


    _registerEventListener : function()
    {
      this.addListener("touchstart", this._onTouchStart, this);
      this.addListener("touchmove", this._onTouchMove, this);
      qx.bom.Element.addListener(this._getKnobElement(), "touchstart", this._onTouchStart, this);
    },


    _unregisterEventListener : function()
    {
      this.removeListener("touchstart", this._onTouchStart, this);
      this.removeListener("touchmove", this._onTouchMove, this);
      qx.bom.Element.removeListener(this._getKnobElement(), "touchstart", this._onTouchStart, this);
    },


    _onTouchStart: function(evt)
    {
      this._isMovingKnob = false;
      this._lastPosition = 0;
      if (!evt.isMultiTouch())
      {
        var knobElement = this._getKnobElement();
        var containerElement = this.getContainerElement();
        this._containerElementWidth = qx.bom.element.Dimension.getWidth(containerElement);
        this._containerElementLeft = qx.bom.element.Location.getLeft(containerElement);
        this._knobWidth = qx.bom.element.Dimension.getWidth(knobElement);

        var position = this._lastPosition =  this._getPosition(evt.getDocumentLeft());

        if (evt.getTarget() == knobElement)
        {
          this._isMovingKnob = true;
          evt.stopPropagation();
        } else {
          this.setValue(this._positionToValue(position));
        }
      }
    },


    _onTouchMove : function(evt)
    {
      if (this._isMovingKnob)
      {
        var position = this._getPosition(evt.getDocumentLeft());
        var pixelPerStep = this._pixelPerStep(this._containerElementWidth);
        // Optimize Performance - only update the position when needed
        if (Math.abs(this._lastPosition - position) > pixelPerStep/2)
        {
          this._lastPosition = position;
          this.setValue(this._positionToValue(position));
        }
        evt.stopPropagation();
        evt.preventDefault();
      }
    },


    _getPosition : function(documentLeft)
    {
      return documentLeft - this._containerElementLeft;
    },


    _getKnobElement : function()
    {
      if (!this._knobElement) {
        var element = this.getContainerElement();
        if (element) {
          this._knobElement = element.childNodes[0];
        }
      }
      return this._knobElement;
    },


    _updateKnobPosition : function()
    {
      this._setKnobPosition(this._valueToPercent(this.getValue()));
    },


    _setKnobPosition : function(percent)
    {
      var knobElement = this._getKnobElement();
      if (knobElement)
      {
        var width = this._containerElementWidth;
        var position = this._percentToPosition(width, percent);

        var marginLeft = this._knobWidth/2;
        if (position > width - this._knobWidth) {
          marginLeft = this._knobWidth;
        } else if (position < this._knobWidth) {
          marginLeft = 0;
        }

        qx.bom.element.Style.set(knobElement, "left", percent + "%");
        qx.bom.element.Style.set(knobElement, "margin-left", "-" + marginLeft + "px");
      }
    },


    _valueToPercent : function(value)
    {
      var min = this.getMinimum();
      var value = this._limitValue(value);
      return ((value - min) * 100) / this._getRange();
    },


    _positionToValue : function(position)
    {
      var width = this._containerElementWidth;

      // Fix the position so that it is easier to set the last value
      // Plus a bugfix: Seems like you can not hit the last pixel of the slider
      // div in the browser
      var pixelPerStep = this._pixelPerStep(width);
      if (position <= 4) {
        return this.getMinimum();
      } else if (position >= width - 4) {
        return this.getMaximum();
      }
      var value = this.getMinimum() + (Math.round(position / pixelPerStep) * this.getStep());
      return this._limitValue(value);
    },


    _percentToPosition : function(width, percent)
    {
      return width * (percent / 100);
    },


    _limitValue : function(value)
    {
      value = Math.min(value, this.getMaximum());
      value = Math.max(value, this.getMinimum());
      return value;
    },


    _pixelPerStep : function(width)
    {
      return width / this._getOverallSteps();
    },


    _getOverallSteps : function()
    {
      return (this._getRange() / this.getStep());
    },


    _getRange : function()
    {
      return this.getMaximum() - this.getMinimum();
    }
  },


  destruct : function()
  {
    this._knobElement = null;
    this._unregisterEventListener();
  }
});