qx.Class.define("qxcompiler.app.ServerApplication", {
  extend: qxcompiler.app.Application,
  
  members: {
    /**
     * Returns the application boot loader template to use
     */
    getLoaderTemplate: function() {
      return this.getAnalyser().getQooxdooPath() + "/../tool/data/generator/oo.loader.tmpl.js"
    }    
  }

});