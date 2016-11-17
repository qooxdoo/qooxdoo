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
    
    testProperty: function() {
      var t = this;
      var Clazz = qx.Class.define(null, {
        extend: qx.core.Object,
        properties: {
          alpha: {
            init: null,
            nullable: true
          }
        }
      }); 
      var obj = new Clazz();
      var p = new qx.Promise(function(resolve) {
        resolve(123);
      });
      obj.setAlpha(p).then(function() {
        t.assertEquals(123, obj.getAlpha());
        t.resume();
      });
      this.wait(1000);
    },
    
    /*
    testEach: function() {
      var t = this;
      var arr = new qx.data.Array();
      arr.push("a");
      arr.push("b");
      arr.push("c");
      var str = "";
      qx.Promise.resolve(arr).each(function(elem) {
        str += item;
      }).then(function() {
        t.assertEquals("abc", str);
        t.resume();
      });
      t.wait(1000);
    },
    */
    
    testGlobalError: function() {
      var t = this;
      qx.event.GlobalError.setErrorHandler(function(ex) {
        t.assertEquals(ex.message, "oops");
        t.resume();
      });
      var self = this;
      var p = new qx.Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve("ok");
        });
      }, this);
      p.then(function(value) {
        throw new Error("oops");
      });
      this.wait(1000);
    }
  }
});