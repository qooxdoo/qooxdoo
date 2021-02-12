qx.Class.define("testapp.Issue309", {
  extend: qx.core.Object,
  
  members: {
    unresolvedDefaultArg: function(caption="Event Recorder") {
      const objectId = caption.replace(/ /g, "").toLocaleLowerCase();
      console.log(objectId);
    },
    
    unresolvedSpreadOperator(dest, ...srcs) {
      srcs.forEach(function(src) {
        if (src) {
          src.forEach(function(elem) {
            if (!qx.lang.Array.contains(dest, src)) {
              dest.push(elem);
            }
          });
        }
      });
      return dest;
    }
    
  }
});
