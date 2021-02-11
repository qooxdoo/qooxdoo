/**
 * @require(qx.core.BaseInit) 
 */

qx.Class.define("testapp.NodeApplication", {
  extend: qx.application.Basic,
  
  members: {
    main() {
      console.log("In Main");
      this.demoAsync();
    },
    
    async demoAsync() {
      await new qx.Promise(resolve => setTimeout(resolve, 500));
    }
  }

});
