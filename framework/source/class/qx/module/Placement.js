qx.Bootstrap.define("qx.module.Placement", {

  statics: {
    
    placeTo : function(target, position, offsets) {
      if (!this[0]) {
        return null;
      }
      
      var axes = {
        x : new qx.util.placement.DirectAxis(),
        y : new qx.util.placement.DirectAxis()
      };
      
      var size = {
        width: this.getWidth(),
        height: this.getHeight()
      };
      
      var parent = this.getParents();
      var area = {
        width : parent.getWidth(),
        height : parent.getHeight()
      };
      
      var target = q.wrap(target).getOffset(); 
      
      var offsets = offsets || {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      };
      
      var splitted = position.split("-");
      var edge = splitted[0];
      var align = splitted[1];
      
      var position = {
        x : q._getPositionX(edge,align),
        y : q._getPositionY(edge,align)
      }
      
      var newLocation = q._computePlacement(axes, size, area, target, offsets, position);
      
      this.setStyles({
        position: "absolute",
        left: newLocation.left + "px",
        top: newLocation.top + "px"
      });
      
      return this;
    },
    
    _computePlacement : function(axes, size, area, target, offsets, position)
    {
      var left = axes.x.computeStart(
        size.width,
        {start: target.left, end: target.right},
        {start: offsets.left, end: offsets.right},
        area.width,
        position.x
      );

      var top = axes.y.computeStart(
        size.height,
        {start: target.top, end: target.bottom},
        {start: offsets.top, end: offsets.bottom},
        area.height,
        position.y
      );

      return {
        left: left,
        top: top
      }
    },
    
    _getPositionX : function(edge, align)
    {
      if (edge == "left") {
        return "edge-start";
      } else if (edge == "right") {
        return "edge-end";
      } else if (align == "left") {
        return "align-start";
      } else if (align == "right") {
        return "align-end";
      }
    },

    _getPositionY : function(edge, align)
    {
      if (edge == "top") {
        return "edge-start";
      } else if (edge == "bottom") {
        return "edge-end";
      } else if (align == "top") {
        return "align-start";
      } else if (align == "bottom") {
        return "align-end";
      }
    }
    
  },
  
  defer : function(statics)
  {
    q.attachStatic({
      "_computePlacement" : statics._computePlacement,
      "_getPositionX" : statics._getPositionX,
      "_getPositionY" : statics._getPositionY
    });
    
    q.attach({
     "placeTo" : statics.placeTo
    });
  }
});