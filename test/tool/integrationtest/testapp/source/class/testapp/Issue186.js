qx.Class.define("testapp.Issue186", {
  extend: qx.core.Object,
  
  members: {
    /**
     * @ignore(process)
     */
    someMethodOne: function() {
      process.exit();
    }
  }
});
