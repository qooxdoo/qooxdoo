qx.Class.define("testapp.Issue461", {
  extend: qx.core.Object,
  
  members: {
    unusedDestructedArray: function() {
      let m = [ 1, "a", "b"];
      let [, name, ext] = m;
      console.log(name+ "." + ext);
    }
    
  }
});
