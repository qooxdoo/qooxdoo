/*
 LGPLv3 <http://www.gnu.org/licenses/lgpl-3.0.txt>
*/
require.def("ace/RenderLoop", ["ace/lib/event"], function(d) {
  var e = function(b) {
    this.onRender = b;
    this.pending = false;
    this.changes = 0
  };
  (function() {
    this.schedule = function(b) {
      this.changes |= b;
      if(!this.pending) {
        this.pending = true;
        var a = this;
        this.setTimeoutZero(function() {
          a.pending = false;
          a.onRender(a.changes);
          a.changes = 0
        })
      }
    };
    if(window.postMessage) {
      this.messageName = "zero-timeout-message";
      this.setTimeoutZero = function(b) {
        if(!this.attached) {
          var a = this;
          d.addListener(window, "message", function(c) {
            if(c.source == window && a.callback && c.data == a.messageName) {
              d.stopPropagation(c);
              a.callback()
            }
          });
          this.attached = true
        }this.callback = b;
        window.postMessage(this.messageName, "*")
      }
    }else {
      this.setTimeoutZero = function(b) {
        setTimeout(b, 0)
      }
    }
  }).call(e.prototype);
  return e
});