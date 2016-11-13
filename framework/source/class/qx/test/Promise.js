qx.Class.define("qx.test.Promise", {
  extend: qx.dev.unit.TestCase,
  
  members: {

    /**
     * Tests a new promise that resolves with no errors
     */
    testNewPromise: function() {
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
    
    /**
     * Tests a new promise that is rejected
     */
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
    
    /**
     * Tests that setting a property value with a promise will delay setting the
     * value until the promise is resolved.  In this case, the property is *not*
     * marked as async and the setXxx method is used
     */
    testPropertySetValueAsPromise1: function() {
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
      this.assertTrue(!!Clazz.prototype.setAlpha);
      this.assertFalse(!!Clazz.prototype.setAlphaAsync);
      var obj = new Clazz();
      var p = new qx.Promise(function(resolve) {
        resolve(123);
      });
      obj.setAlpha(p);
      p.then(function() {
        t.assertEquals(123, obj.getAlpha());
        t.resume();
      });
      this.wait(1000);
    },
    
    /**
     * Tests that setting a property value with a promise will delay setting the
     * value until the promise is resolved.  In this case, the property *is*
     * marked as async and the setXxxAsync method is used to test chaining
     */
    testPropertySetValueAsPromise2: function() {
      var t = this;
      var Clazz = qx.Class.define(null, {
        extend: qx.core.Object,
        properties: {
          alpha: {
            init: null,
            nullable: true,
            async: true
          }
        }
      }); 
      this.assertTrue(!!Clazz.prototype.setAlpha);
      this.assertTrue(!!Clazz.prototype.setAlphaAsync);
      var obj = new Clazz();
      var p = new qx.Promise(function(resolve) {
        resolve(123);
      });
      obj.setAlphaAsync(p).then(function() {
        t.assertEquals(123, obj.getAlpha());
        t.resume();
      });
      this.wait(1000);
    },
    
    /**
     * Tests that a property apply method can return a promise; in this case, the
     * property is not marked as async so the apply method is only able to delay
     * the event handler
     */
    testPropertySetValueAsyncApply1: function() {
      var t = this;
      var p;
      var Clazz = qx.Class.define(null, {
        extend: qx.core.Object,
        properties: {
          alpha: {
            init: null,
            nullable: true,
            apply: "_applyAlpha",
            event: "changeAlpha"
          }
        },
        
        members: {
          _applyAlpha: function(value, oldValue) {
            return p = new qx.Promise(function(resolve) {
              setTimeout(function() {
                resolve("xyz");
              }, 250);
            });
          }
        }
      }); 
      var obj = new Clazz();
      var eventFired = 0;
      obj.addListener("changeAlpha", function(evt) {
        eventFired++;
      });
      obj.setAlpha("abc");
      this.assertTrue(!!p);
      this.assertEquals(0, eventFired);
      this.assertEquals("abc", obj.getAlpha());
      p.then(function(value) {
        this.assertEquals("xyz", value); // "xyz" because this is the internal promise
        this.assertEquals("abc", obj.getAlpha());
        this.assertEquals(1, eventFired);
        t.resume();
      }, this);
      this.wait(1000);
    },
    
    /**
     * Tests that a property apply method can return a promise; in this case, the
     * property *is* marked as async, and we use the setAlphaAsync to test chaining
     */
    testPropertySetValueAsyncApply2: function() {
      var t = this;
      var Clazz = qx.Class.define(null, {
        extend: qx.core.Object,
        properties: {
          alpha: {
            init: null,
            nullable: true,
            async: true,
            apply: "_applyAlpha",
            event: "changeAlpha"
          }
        },
        
        members: {
          _applyAlpha: function(value, oldValue) {
            return new qx.Promise(function(resolve) {
              setTimeout(function() {
                resolve("xyz");
              }, 250);
            });
          }
        }
      }); 
      var obj = new Clazz();
      var eventFired = 0;
      obj.addListener("changeAlpha", function(evt) {
        eventFired++;
      });
      var p = obj.setAlphaAsync("abc");
      this.assertEquals(0, eventFired);
      p.then(function(value) {
        this.assertEquals("abc", value);
        this.assertEquals("abc", obj.getAlpha());
        this.assertEquals(1, eventFired);
        
        // Set the same value, should return a new promise but not fire an event
        p = obj.setAlphaAsync("abc");
        p.then(function(value) {
          this.assertEquals("abc", value);
          this.assertEquals("abc", obj.getAlpha());
          this.assertEquals(1, eventFired);
          t.resume();
        }, this);
      }, this);
      this.wait(1000);
    },
    
    /**
     * Tests that a property apply method can take a promise
     */
    testPropertySetValueAsyncApply3: function() {
      var t = this;
      var Clazz = qx.Class.define(null, {
        extend: qx.core.Object,
        properties: {
          alpha: {
            init: null,
            nullable: true,
            check: "qx.Promise"
          }
        }
      }); 
      var obj = new Clazz();
      var p = qx.Promise.resolve("hello");
      obj.setAlpha(p);
      this.assertEquals(p, obj.getAlpha());
    },
    
    /**
     * Tests the each method of promise, using qx.data.Array which the Bluebird implementation
     * does not understand.  The values are scalar values
     */
    testEach1: function() {
      var t = this;
      var arr = new qx.data.Array();
      arr.push("a");
      arr.push("b");
      arr.push("c");
      var str = "";
      var promise = qx.Promise.resolve(arr);
      promise.forEach(function(item) {
        str += item;
      }).then(function() {
        t.assertEquals("abc", str);
        t.resume();
      });
      t.wait(1000);
    },
    
    /**
     * Tests the each method of promise, using qx.data.Array which the Bluebird implementation
     * does not understand.  The values are a mixture of promises and scalar values
     */
    testEach2: function() {
      var t = this;
      var arr = new qx.data.Array();
      arr.push(new qx.Promise(function(resolve) {
        setTimeout(function() { resolve("a"); }, 500);
      }));
      arr.push(new qx.Promise(function(resolve) {
        setTimeout(function() { resolve("b"); }, 300);
      }));
      arr.push(new qx.Promise(function(resolve) {
        setTimeout(function() { resolve("c"); }, 100);
      }));
      arr.push("d");
      arr.push("e");
      var str = "";
      var promise = qx.Promise.resolve(arr);
      this.assertInstance(promise, qx.Promise);
      var pEach = promise.forEach(function(item) {
        str += item;
      });
      this.assertInstance(pEach, qx.Promise);
      var pThen = pEach.then(function() {
        t.assertEquals("abcde", str);
        t.resume();
      });
      this.assertInstance(pThen, qx.Promise);
      t.wait(1000);
    },
    
    /**
     * Tests unhandled rejections being passed to the global error handler
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
    },
    
    /**
     * Tests promisification of methods 
     */
    testMethod: function() {
      var t = this;
      var fn = qx.Promise.method(function(value) {
        return value;
      });
      var promise = fn("yes");
      this.assertInstance(promise, qx.Promise);
      promise.then(function(value) {
        t.assertEquals(value, "yes");
        t.resume();
      });
      this.wait(1000);
    },
    
    /**
     * Tests binding of all callbacks via .bind() 
     */
    testBinding1: function() {
      var t = this;
      var p = qx.Promise.resolve("hello").bind(this);
      p.then(function(value) {
        qx.core.Assert.assertIdentical(t, this);
        t.resume();
      });
      this.wait(1000);
    },
    
    /**
     * Tests binding on a per-method basis
     */
    testBinding2: function() {
      var t = this;
      var p = qx.Promise.forEach(
          ["a", "b", "c"], 
          function(item) {
            qx.core.Assert.assertIdentical(t, this);
          }, 
          this)
        .then(function(value) {
          qx.core.Assert.assertIdentical(t, this);
          this.resume();
        }, this);
      this.wait(1000);
    },
    
    testMarshal: function() {
      var marshal = new qx.data.marshal.Json();
      marshal.toClass(qx.test.Promise.TEST_MODEL.children[0], true);
      var model = marshal.toModel(qx.test.Promise.TEST_MODEL.children[0]);
    }
  },
  
  statics: {
    TEST_MODEL: {
        "name": "qx",
        "children": [
          {
            "name": "test",
            "children": [
              {
                "name": "Class",
                "children": [
                  {
                    "name": "test: instantiate class in defer and access property"
                  },
                  {
                    "name": "testAbstract"
                  },
                  {
                    "name": "testAnonymous"
                  }
                ]
              },
              {
                "name": "Bootstrap",
                "children": [
                  {
                    "name": "test: define bootstrap class, which extends 'Error'"
                  },
                  {
                    "name": "test: define class with constructor"
                  },
                  {
                    "name": "test: extend from Bootstrap class"
                  }
                ]
              }
            ]
          }
        ]
      }
  }
});