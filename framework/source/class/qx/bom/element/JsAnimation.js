qx.Bootstrap.define("qx.bom.element.JsAnimation", 
{
  statics :
  {
    __stepTime : 20,

    animate : function(el, desc) {

      console.log("desc", desc);
      var duration = desc.duration;
      var keyFrames = desc.keyFrames;

      var keys = this.__getOrderedKeys(keyFrames);
      var steps = parseInt(duration / this.__stepTime, 10);
      var delta = new Array(steps);

      var keyIndex = 1;
      delta[0] = keyFrames[0];
      var last = keyFrames[0];
      var next = keyFrames[keys[keyIndex]];
      // for every step
      for (var i=1; i < delta.length; i++) {
        if (i * 100 / steps == keys[keyIndex]) {
          last = next;
          keyIndex++;
          next = keyFrames[keys[keyIndex]];
        }
        delta[i] = {};
        // for every property
        for (var name in next) {
          var range = parseInt(next[name]) - parseInt(last[name]);
          var stepValue = parseInt(range / -parseInt(steps * (keys[keyIndex-1] - keys[keyIndex])/ 100));

          delta[i][name] = (parseInt(delta[i-1][name]) + stepValue) + "px";
        };
      };

      var i = 0;
      var id = window.setInterval(function() {
        steps--;
        var values = delta[i];
        for (var name in values) {
          el.style[name] = values[name];
          console.log(i, name, values[name]);
        }

        i++;
        if (steps < 0) {
          window.clearInterval(id);
        }
      }, this.__stepTime);
    },



    __getOrderedKeys : function(keyFrames) {
      var keys = qx.Bootstrap.getKeys(keyFrames);
      for (var i=0; i < keys.length; i++) {
        keys[i] = parseInt(keys[i], 10);
      };
      keys.sort(function(a,b) {return a>b;});
      return keys;
    }
  }
});
