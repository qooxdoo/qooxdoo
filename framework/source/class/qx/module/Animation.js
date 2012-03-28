/* ************************************************************************

#ignore(qx.bom.element.Style)

************************************************************************ */

qx.Bootstrap.define("qx.module.Animation", { 
  statics :
  {
    init : function() {
      this.__animationHandles = [];
    },

    _fadeOut : {duration: 700, timing: "ease-out", keyFrames : {
      0: {opacity: 1},
      100: {opacity: 0}
    }},


    _fadeIn : {duration: 700, timing: "ease-in", keyFrames : {
      0: {opacity: 0},
      100: {opacity: 1}
    }},


    __setStyle : function(el, name, value) {
      name = qx.lang.String.camelCase(name);
      if (qx && qx.bom && qx.bom.element && qx.bom.element.Style) {
        qx.bom.element.Style.set(el, name, value);
      } else {
        el.style[name] = value;
      }
    },


    animate : function(desc) {
      var returnHandle;
      for (var i=0; i < this.length; i++) {
        var handle = qx.bom.element.Animation.animate(this[i], desc);
        if (i === 0) {
          returnHandle = handle;
        }
      };
      return returnHandle;
    },


    fadeIn : function() {
      var returnHandle;
      for (var i=0; i < this.length; i++) {
        qx.module.Animation.__setStyle(this[i], "opacity", 0);
        qx.module.Animation.__setStyle(this[i], "display", "");
        var handle = qx.bom.element.Animation.animate(this[i], qx.module.Animation._fadeIn);
        handle.on("end", function(el) {
          qx.module.Animation.__setStyle(el, "opacity", 1);
        });
        if (i === 0) {
          returnHandle = handle;
        }
      };
      return returnHandle;
    },


    fadeOut : function() {
      var returnHandle;
      for (var i=0; i < this.length; i++) {
        var handle = qx.bom.element.Animation.animate(this[i], qx.module.Animation._fadeOut);
        handle.on("end", function(el) {
          qx.module.Animation.__setStyle(el, "display", "none");
        });
        if (i === 0) {
          returnHandle = handle;
        }
      };
      return handle;
    }
  },


  defer : function(statics) {
    q.attach({
      "animate" : statics.animate,
      "fadeIn" : statics.fadeIn,
      "fadeOut" : statics.fadeOut
    });

    q.attachInit(statics.init);
  }
});
