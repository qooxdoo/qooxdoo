/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A scroll bar for the scroll pane.
 */
qx.Class.define("qx.ui.core.ScrollBar",
{
  extend : qx.ui.core.Widget,

  construct : function(orientation)
  {
    this.base(arguments);

    this._slider = new qx.ui.slider.Slider(orientation);
    this._slider.addListener("changeValue", this._onChangeValueSlider, this);

    this._btnBegin = new qx.ui.form.RepeatButton().set({
      appearance : "scrollbar-button-start"
    });
    this._btnBegin.addListener("execute", this._slider.scrollStepBack, this._slider);


    this._btnEnd = new qx.ui.form.RepeatButton().set({
      appearance : "scrollbar-button-end"
    });
    this._btnEnd.addListener("execute", this._slider.scrollStepForward, this._slider);


    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
  },


  properties :
  {
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      init : "horizontal",
      apply : "_applyOrientation"
    },

    value :
    {
      check : "Integer",
      init : 0,
      apply : "_applyValue",
      event : "changeValue"
    },

    maximum :
    {
      check : "Integer",
      init : 100,
      apply : "_applyMaximum"
    },

    appearance :
    {
      refine : true,
      init : "scrollbar"
    }

  },


  members :
  {
    _onChangeValueSlider : function(e)
    {
      if (this._ignoreValueChange) {
        return;
      }
      this.setValue(e.getValue());
    },


    _applyOrientation : function(value, old)
    {
      var isHorizontal = value === "horizontal";

      this.setAllowStretchX(isHorizontal);
      this.setAllowStretchY(!isHorizontal);

      var layout = isHorizontal ? new qx.ui.layout.HBox : new qx.ui.layout.VBox;
      this.setLayout(layout);

      // Add children to layout
      layout.add(this._btnBegin);
      layout.add(this._slider, {flex: 1});
      layout.add(this._btnEnd);

      if (isHorizontal)
      {
        this.addState("horizontal");
        this._btnBegin.addState("horizontal");
        this._btnEnd.addState("horizontal");
      }
      else
      {
        this.removeState("horizontal");
        this._btnBegin.removeState("horizontal");
        this._btnEnd.removeState("horizontal");
      }

      this._slider.setOrientation(value);
      this._slider.set({
        allowStretchX: true,
        allowStretchY: true
      });
    },


    _applyValue : function(value, old)
    {
      this._ignoreValueChange = true;
      this._slider.setValue(value);
      this._ignoreValueChange = false;
    },

    _applyMaximum : function(value, old) {
      this._slider.setMaximum(value);
    }

  }
});
