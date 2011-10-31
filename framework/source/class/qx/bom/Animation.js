qx.Bootstrap.define("qx.bom.Animation", 
{ 
  statics :
  {
    animate : null,
    supports3d : null
  }
});

/**
 * @lint ignoreUndefined(Anni)
 */
(function(ctx) {
  /**
    * Helper object which contains the cross browser stuff.
    */
   var Helper = {
     isArray : qx.Bootstrap.isArray,
     createSheet : qx.bom.Stylesheet.createElement,
     addRule : qx.bom.Stylesheet.addRule,
     addListener : qx.bom.Event.addNativeListener,
     removeListener : qx.bom.Event.removeNativeListener,
     isWebkit : function() {
       // return window.navigator.userAgent.indexOf("AppleWebKit/") != -1;
       return qx.core.Environment.get("engine.name") == "webkit";
     },
     isGecko : function() {
       // return window.controllers && window.navigator.product === "Gecko";
       return qx.core.Environment.get("engine.name") == "gecko";
     },
     supports3d : function() {
       // borrowed from modernizr
       var div = document.createElement('div'),
         ret = false,
         properties = ['perspectiveProperty', 'WebkitPerspective'];
       for (var i = properties.length - 1; i >= 0; i--){
         ret = ret ? ret : div.style[properties[i]] != undefined;
       };

       // webkit has 3d transforms disabled for chrome, though
       //   it works fine in safari on leopard and snow leopard
       // as a result, it 'recognizes' the syntax and throws a false positive
       // thus we must do a more thorough check:
       if (ret){
         var st = document.createElement('style');
         // webkit allows this media query to succeed only if the feature is enabled.    
         // "@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-ms-transform-3d),(-webkit-transform-3d),(modernizr){#modernizr{height:3px}}"
         st.textContent = '@media (-webkit-transform-3d){#test3d{height:3px}}';
         document.getElementsByTagName('head')[0].appendChild(st);
         div.id = 'test3d';
         document.body.appendChild(div);

         ret = div.offsetHeight === 3;

         st.parentNode.removeChild(st);
         div.parentNode.removeChild(div);
       }
       return ret;
     }
   };


  /**
   * Main object.
   * 
   * @lint ignoreUndefined(Anni)
   */
  ctx.Anni = {
    // initialization
    __sheet : null,
    __rules : {},
    __rulePrefix : "Anni",
    __id : 0,

    __transitionKeys : {
      "scale": true,
      "rotate" : true,
      "skew" : true,
      "translate" : true
    },

    __dimensions : ["X", "Y", "Z"],


    __getStyleName : function(name) {
      if (Helper.isGecko()) {
        if (name == "transform") {
          return "-moz-transform";
        }
        if (name == "@keyframes") {
          return "@-moz-keyframes";
        }
        if (name == "animationend") {
          return "animationend";
        }
        return ("-moz-" + name).replace(/-(.)/g, function(x) {return x.charAt(1).toUpperCase();});
      } else if (Helper.isWebkit()) {
        if (name == "@keyframes") {
          return "@-webkit-keyframes";
        }
        if (name == "animationend") {
          return "webkitAnimationEnd";
        }
        return "-webkit-" + name;
      }
      // return the names defined in the spec as fallback
      return name;
    },


    animate : function(el, desc) {
      this.__normalizeDesc(desc);
      if (!this.__sheet) {
        this.__sheet = Helper.createSheet();
      }
      var keyFrames = desc.keyFrames;
      var name = this.__addKeyFrames(keyFrames, desc.reverse);

      var style = 
        name + " " + 
        desc.duration + "ms " + 
        desc.repeat + " " + 
        desc.timing + " " +
        (desc.alternate ? "alternate" : "");

      var animation = new Animation();
      animation.desc = desc;
      animation.el = el;
      el.$$animation = animation;
      Helper.addListener(el, this.__getStyleName("animationend"), this.__onAnimationEnd);

      el.style[this.__getStyleName("animation")] = style;

      // additional transform keys
      if (desc.origin != null) {
        el.style[this.__getStyleName("transform-origin")] = desc.origin;
      }

      return animation;
    },


    __onAnimationEnd : function(e) {
      var el = e.target;
      var animation = el.$$animation;
      var desc = animation.desc;
      // reset the styling
      el.style[ctx.Anni.__getStyleName("animation")] = "";
      if (desc.origin != null) {
        el.style[ctx.Anni.__getStyleName("transform-origin")] = "";
      }

      if (desc.keep != null) {
        // keep the element at this animation step
        var endFrame = desc.keyFrames[desc.keep];
        var transforms = {};
        for (var style in endFrame) {
          if (style in ctx.Anni.__transitionKeys) {
            transforms[style] = endFrame[style];
          } else {
            el.style[style] = endFrame[style];
          }
        }

        // transform keeping
        var transformCss = ctx.Anni.__transformsMapToCss(transforms);
        if (transformCss != "") {
          var style = ctx.Anni.__getStyleName("transform");
          el.style[style] = transformCss;
        }
      }

      Helper.removeListener(el, ctx.Anni.__getStyleName("animationend"), ctx.Anni.__onAnimationEnd);

      if (animation.onEnd) {
        animation.onEnd(el);
      }
      
      delete el.$$animation;
      animation.el = null;
      animation.ended = true;
    },


    __normalizeDesc : function(desc) {
      if (!desc.hasOwnProperty("alterante")) {
        desc.alternate = false;
      }
      if (!desc.hasOwnProperty("keep")) {
        desc.keep = null;
      }
      if (!desc.hasOwnProperty("reverse")) {
        desc.reverse = false;
      }
      if (!desc.hasOwnProperty("repeat")) {
        desc.repeat = 1;
      }
      if (!desc.hasOwnProperty("timing")) {
        desc.timing = "linear";
      }
      if (!desc.hasOwnProperty("origin")) {
        desc.origin = null;
      }
    },


    /** 
     * CSS HELPER
     */
    __addKeyFrames : function(frames, reverse) {
      var rule = "";

      // for each key frame
      for (var position in frames) {
        rule += (reverse ? -(position - 100) : position) + "% {";

        var frame = frames[position];
        var transforms = {};
        // each style
        for (var style in frame) {
          if (style in this.__transitionKeys) {
            transforms[style] = frame[style];
          } else {
            rule += style + ":" + frame[style] + ";";
          }
        }

        // transform handling
        var value = this.__transformsMapToCss(transforms);
        if (value != "") {
          var style = this.__getStyleName("transform");
          rule += style + ":" + value + ";";
        }

        rule += "} ";
      }

      // cached shorthand
      if (this.__rules[rule]) {
        return this.__rules[rule];
      }

      var name = this.__rulePrefix + this.__id++;
      var selector = this.__getStyleName("@keyframes") + " " + name;
      Helper.addRule(this.__sheet, selector, rule);

      this.__rules[rule] = name;

      return name;
    },


    __transformsMapToCss : function(transforms) {
      var value = "";
      for (var func in transforms) {

        var params = transforms[func];
        // if an array is given
        if (Helper.isArray(params)) {
          for (var i=0; i < params.length; i++) {
            if (params[i] == undefined) {
              continue;
            }
            value += func + this.__dimensions[i] + "(";
            value += params[i];
            value += ") ";
          };
        // case for single values given
        } else {
          // single value case
          value += func + "(" + transforms[func] + ") ";
        }
      }

      return value;
    },


    supports3d : Helper.supports3d
  };




  /**
   * Animation object which will be the return type of an animation call.
   */
  function Animation() {
    this.playing = true;
    this.ended = false;
  };

  Animation.prototype.pause = function() {
    if (this.el) {
      this.el.style[ctx.Anni.__getStyleName("animation-play-state")] = "paused";
      this.el.$$animation.playing = false;    
    } else {
      console.log("already done.");
    }
  };

  Animation.prototype.play = function() {
    if (this.el) {
      this.el.style[ctx.Anni.__getStyleName("animation-play-state")] = "running";
      this.el.$$animation.playing = true;    
    } else {
      console.log("already done.");
    }
  };

  Animation.prototype.stop = function() {
    if (this.el) {
      this.el.style[ctx.Anni.__getStyleName("animation-play-state")] = "";
      this.el.style[ctx.Anni.__getStyleName("animation")] = "";
      this.el.$$animation.playing = false;
      this.el.$$animation.ended = true;
    } else {
      console.log("already done.");
    }
  };

  // expose to qooxdoo
  qx.bom.Animation.animate = function(el, desc) {
    return ctx.Anni.animate.call(ctx.Anni, el, desc)
  }
  qx.bom.Animation.supports3d = ctx.Anni.supports3d;
})({});