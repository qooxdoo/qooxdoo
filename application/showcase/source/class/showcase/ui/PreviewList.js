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
  }
});