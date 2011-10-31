qx.Bootstrap.define("qx.bom.client.CssAnimation", 
{
  statics : {
    getPlayState : function() {
      if (qx.core.Environment.get("engine.name") == "gecko") {
        return "MozAnimationPlayState";
      } else if (qx.core.Environment.get("engine.name") == "webkit") {
        return "WebkitAnimationPlayState";
      }
      // return the names defined in the spec as fallback
      return "AnimationPlayState";
    },


    getAnimation : function() {
      if (qx.core.Environment.get("engine.name") == "gecko") {
        return "MozAnimation";
      } else if (qx.core.Environment.get("engine.name") == "webkit") {
        return "WebkitAnimation";
      }
      // return the names defined in the spec as fallback
      return "Animation";
    },


    getAnmiationEnd : function() {
      if (qx.core.Environment.get("engine.name") == "gecko") {
        return "animationend";
      } else if (qx.core.Environment.get("engine.name") == "webkit") {
        return "webkitAnimationEnd";
      }
      // return the names defined in the spec as fallback
      return "animationend";
    },


    getTransformOrigin : function() {
      if (qx.core.Environment.get("engine.name") == "gecko") {
        return "MozTransformOrigin";
      } else if (qx.core.Environment.get("engine.name") == "webkit") {
        return "WebkitTransformOrigin";
      }
      // return the names defined in the spec as fallback
      return "TransformOrigin";
    },


    getTransform : function() {
      if (qx.core.Environment.get("engine.name") == "gecko") {
        return "MozTransform";
      } else if (qx.core.Environment.get("engine.name") == "webkit") {
        return "WebkitTransform";
      }
      // return the names defined in the spec as fallback
      return "Transform";
    },


    getKeyFrames : function() {
      if (qx.core.Environment.get("engine.name") == "gecko") {
        return "@-moz-keyframes";
      } else if (qx.core.Environment.get("engine.name") == "webkit") {
        return "@-webkit-keyframes";
      }
      // return the names defined in the spec as fallback
      return "@keyframes";
    },
    
    
    get3D : function() {
      var div = document.createElement('div');
      var ret = false;
      var properties = ["perspectiveProperty", "WebkitPerspective", "MozPerspective"];
      for (var i = properties.length - 1; i >= 0; i--){
        ret = ret ? ret : div.style[properties[i]] != undefined;
      };

      return ret;
    }
  },


  defer : function(statics) {
    qx.core.Environment.add("css.animation.keyframes", statics.getKeyFrames);
    qx.core.Environment.add("css.animation.transform", statics.getTransform);
    qx.core.Environment.add("css.animation.transformorigin", statics.getTransformOrigin);
    qx.core.Environment.add("css.animation.endevent", statics.getAnmiationEnd);
    qx.core.Environment.add("css.animation.style", statics.getAnimation);
    qx.core.Environment.add("css.animation.playstate", statics.getPlayState);
    qx.core.Environment.add("css.animation.3d", statics.get3D);
  }
});