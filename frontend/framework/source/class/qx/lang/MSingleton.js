qx.Mixin.define("qx.lang.MSingleton", {
  statics: {
    getInstance: function() {
      if (!this.$$INSTANCE)
      {
        this.$$ALLOWCONSTRUCT = true;
        this.$$INSTANCE = new this;
        delete this.$$ALLOWCONSTRUCT;
      }

      return this.$$INSTANCE;
    }
  }
});