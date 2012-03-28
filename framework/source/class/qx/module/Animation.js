/* ************************************************************************

#ignore(qx.bom.element.Style)

************************************************************************ */

qx.Bootstrap.define("qx.module.Animation", {
  events : {
    "animationEnd" : undefined
  },

  statics :
  {
    init : function() {
      this.__animationHandles = [];
    },

    _fadeOut : {duration: 700, timing: "ease-out", keep: 100, keyFrames : {
      0: {opacity: 1},
      100: {opacity: 0, display: "none"}
    }},


    _fadeIn : {duration: 700, timing: "ease-in", keep: 100, keyFrames : {
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
      if (this.__animationHandles.length > 0) {
        throw new Error("Only one animation at a time.");
      }
      for (var i=0; i < this.length; i++) {
        var handle = qx.bom.element.Animation.animate(this[i], desc);
        var self = this;
        handle.on("end", function() {
          var handles = self.__animationHandles;
          handles.splice(self.indexOf(handle), 1);
          if (handles.length == 0) {
            self.emit("end");
          }
        }, handle);
        this.__animationHandles.push(handle);
      };
      return this;
    },


    play : function() {
      for (var i=0; i < this.__animationHandles.length; i++) {
        this.__animationHandles[i].play();
      };
      return this;
    },


    pause : function() {
      for (var i=0; i < this.__animationHandles.length; i++) {
        this.__animationHandles[i].pause();
      };
      return this;
    },


    stop : function() {
      for (var i=0; i < this.__animationHandles.length; i++) {
        this.__animationHandles[i].stop();
      };
      this.__animationHandles = [];
      return this;
    },


    isPlaying : function() {
      for (var i=0; i < this.__animationHandles.length; i++) {
        if (this.__animationHandles[i].isPlaying()) {
          return true;
        }
      };
      return false;
    },


    isEnded : function() {
      for (var i=0; i < this.__animationHandles.length; i++) {
        if (!this.__animationHandles[i].isEnded()) {
          return false;
        }
      };
      return true;
    },


    fadeIn : function() {
      return this.animate(qx.module.Animation._fadeIn);
    },


    fadeOut : function() {
      return this.animate(qx.module.Animation._fadeOut);
    }
  },


  defer : function(statics) {
    q.attach({
      "animate" : statics.animate,
      "fadeIn" : statics.fadeIn,
      "fadeOut" : statics.fadeOut,
      "play" : statics.play,
      "pause" : statics.pause,
      "stop" : statics.stop,
      "isEnded" : statics.isEnded,
      "isPlaying" : statics.isPlaying
    });

    q.attachInit(statics.init);
  }
});
