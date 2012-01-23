qx.Bootstrap.define("qx.module.Animation", { 
  statics :
  {
    _fadeOut : {duration: 1000, keyFrames : {
      0: {opacity: 1},
      100: {opacity: 0}
    }},


    _fadeIn : {duration: 1000, keyFrames : {
      0: {opacity: 0},
      100: {opacity: 1}
    }},


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
        this[i].style["opacity"] = 0;
        this[i].style["display"] = "";
        var handle = qx.bom.element.Animation.animate(this[i], qx.module.Animation._fadeIn);
        handle.onEnd(function(el) {
          el.style["opacity"] = 1;
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
        handle.onEnd(function(el) {
          el.style["display"] = "none";
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
  }
});
