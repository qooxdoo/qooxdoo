qx.Class.define("qx.test.TestPromise", {
  extend: qx.dev.unit.TestCase,
  
  members: {
    
    testResolve: function() {
      var self = this;
      var p = new qx.Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve("ok");
        });
      }, this);
      p.then(function(value) {
        this.assertIdentical(this, self);
        this.assertEquals(value, "ok");
        this.resume();
      }, function(err) {
        this.assertTrue(false);
        this.resume();
      });
      this.wait(1000);
    },
    
    testReject: function() {
      var self = this;
      var p = new qx.Promise(function(resolve, reject) {
        setTimeout(function() {
          reject(new Error("oops"));
        });
      }, this);
      p.then(function(value) {
        this.assertTrue(false);
        this.resume();
      }, function(err) {
        this.assertIdentical(this, self);
        this.assertEquals(err.message, "oops");
        this.resume();
      });
      this.wait(1000);
    },
