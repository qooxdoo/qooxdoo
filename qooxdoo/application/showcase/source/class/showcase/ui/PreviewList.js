/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("showcase.ui.PreviewList",
{
  extend : qx.ui.form.List,

  construct : function()
  {
    this.base(arguments, true);

    var slider = this.getChildControl("scrollbar-x").getChildControl("slider");
    this._knob = slider.getChildControl("knob");

    this._knob.addListener("mouseover", function() {
      this._knob.addState("hovered");
    }, this);

    this._knob.addListener("mouseout", this._onMouseOut, this);
    slider.addListener("losecapture", this._onMouseOut, this);
  },

  properties :
  {
    appearance :
    {
      refine: true,
      init: "preview-list"
    },

    height : {
      refine: true,
      init: null
    }
  },

  members :
  {
    _onMouseOut : function() {
      this._knob.removeState("hovered");
    }
  },

  destruct : function()
  {
    this._disposeObjects("_knob");
  }
});