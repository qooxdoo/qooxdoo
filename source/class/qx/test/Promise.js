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

    testCatchFinally: function() {
    	var caughtException = null;
    	qx.Promise.resolve()
    		.then(function() {
    			throw new Error("oops");
    		}).catch(function(ex) {
    			caughtException = ex;
	    	}).finally(function() {
	      	this.assertNotNull(caughtException);
	      	this.resume();
	    	}, this);
    	this.wait(1000);
    },

    /**
     * Tests the qx.Promise.allOf method
     */
    testAllOf: function() {
      var t = this;
      var dt = new Date();
      var obj = {
          a: new qx.Promise(),
          b: new qx.Promise(),
          c: new qx.Promise(),
          d: "four",
          e: dt
      }
      qx.Promise.allOf(obj)
        .then(function(obj2) {
          t.assertTrue(obj === obj2);
          t.assertEquals("one", obj.a);
          t.assertEquals("two", obj.b);
          t.assertEquals("three", obj.c);
          t.assertEquals("four", obj.d);
          t.assertTrue(obj.e === dt);
          t.resume();
        });
      obj.a.then(function() {
        obj.b.resolve("two");
      });
      obj.b.then(function() {
        obj.c.resolve("three");
      });
      obj.a.resolve("one");
      t.wait(1000);
    },

    /**
     * Tests that setting a property value with a promise will delay setting the
     * value until the promise is resolved.  In this case, the property is *not*
     * marked as async and the setXxx method is used
     */
    testPropertySetValueAsPromise1: function() {
      var t = this;
      var Clazz = qx.Class.define("testPropertySetValueAsPromise1.Clazz", {
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
        qx.Class.undefine("testPropertySetValueAsPromise1.Clazz");
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
      var Clazz = qx.Class.define("testPropertySetValueAsPromise2.Clazz", {
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
        qx.Class.undefine("testPropertySetValueAsPromise2.Clazz");
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
      var Clazz = qx.Class.define("testPropertySetValueAsyncApply1.Clazz", {
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
        qx.Class.undefine("testPropertySetValueAsyncApply1.Clazz");
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
      var Clazz = qx.Class.define("testPropertySetValueAsyncApply2.Clazz", {
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
          qx.Class.undefine("testPropertySetValueAsyncApply2.Clazz");
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
      var Clazz = qx.Class.define("testPropertySetValueAsyncApply3.Clazz", {
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
      qx.Class.undefine("testPropertySetValueAsyncApply3.Clazz");
    },

    testBinding: function() {
      var t = this;
      var AsyncClazz = qx.Class.define("testBinding.AsyncClazz", {
        extend: qx.core.Object,
        properties: {
          alpha: {
            init: null,
            nullable: true,
            async: true,
            event: "changeAlpha"
          }
        },

        members: {
          _applyAlpha: function(value, oldValue) {
            return new qx.Promise(function(resolve) {
              setTimeout(resolve, 250);
            });
          }
        }
      });
      var SyncClazz = qx.Class.define("testBinding.SyncClazz", {
        extend: qx.core.Object,
        properties: {
          bravo: {
            init: null,
            nullable: true,
            event: "changeBravo"
          }
        }
      });

      /*
       * Test binding an async property to a "normal" sync property
       */
      var asyncToSync = new qx.Promise(function(resolve) {
	      var asyncObj = new AsyncClazz();
	      var syncObj = new SyncClazz();

	      var p1 = new qx.Promise();
        asyncObj.addListenerOnce("changeAlphaAsync", function(evt) {
        	var data = evt.getData();
        	this.assertTrue(data instanceof qx.Promise);
        	p1.resolve();
        }, this);

	      var p2 = new qx.Promise();
	      var bravoEvents = 0;
        var id = syncObj.addListener("changeBravo", function(evt) {
        	bravoEvents++;
        	this.assertTrue(bravoEvents <= 2);
        	var data = evt.getData();

        	// First event is .bind() setting the initial value
        	if (bravoEvents == 1) {
        		this.assertNull(data);

        	// Second event was caused by asyncObj.setAlphaAsync()
        	} else if (bravoEvents == 2) {
	        	this.assertEquals("zyx", data);
	        	syncObj.removeListenerById(id);
	        	p2.resolve();
        	}
        }, this);

        asyncObj.getAlphaAsync();
	      asyncObj.bind("alphaAsync", syncObj, "bravo");
	      asyncObj.setAlphaAsync("zyx");
	      qx.Promise.all([p1, p2]).then(function() {
		      var p3 = new qx.Promise();
	        syncObj.addListenerOnce("changeBravo", function(evt) {
	        	var data = evt.getData();
	        	this.assertEquals("wvu", data);
	        	p3.resolve();
	        }, this);

		      asyncObj.setAlphaAsync("wvu");
		      p3.then(function() {
		      	this.resume();
		      }, this);

	      }, this);
      }, this);

      /*
       * Test binding a "normal" sync property to an async property
       */
      asyncToSync.then(function() {
	      var asyncObj = new AsyncClazz();
	      var syncObj = new SyncClazz();

	      var p1 = new qx.Promise();
	      asyncObj.addListenerOnce("changeAlphaAsync", function(evt) {
	      	var data = evt.getData();
	      	this.assertEquals("def", data);
	      	p1.resolve();
	      }, this);

	      syncObj.bind("bravo", asyncObj, "alphaAsync");
	      syncObj.setBravo("def");

	      p1.then(function() {
		      var p2 = new qx.Promise();
		      asyncObj.addListenerOnce("changeAlphaAsync", function(evt) {
		      	var data = evt.getData();
		      	this.assertEquals("ghi", data);
		      	p2.resolve();
		      }, this);

		      syncObj.setBravo("ghi");
		      return p2.then(function() {

		      	qx.Class.undefine("testBinding.AsyncClazz");
		      	qx.Class.undefine("testBinding.SyncClazz");
		      	this.resume();
		      }, this);
	      }, this);
      }, this);

      this.wait(1000);
    },

    /**
     * Tests event handlers bound to the "changeXxxAsync" events, and which return
     * a promise.  Event handlers must be triggered in sequence and by returning
     * a promise will defer subsequent event handlers from firing
     */
    testAsyncEventHandlers: function() {
      var Clazz = qx.Class.define("testAsyncEventHandlers.Clazz", {
        extend: qx.core.Object,
        properties: {
        	value: {

        	},
          alpha: {
            init: null,
            nullable: true,
            async: true,
            apply: "_applyAlpha",
            event: "changeAlpha"
          },
          bravo: {
            init: null,
            nullable: true,
            async: true,
            apply: "_applyBravo",
            event: "changeBravo"
          }
        },

        members: {
        	_applyAlpha: function(value, oldValue) {
            var p = new qx.Promise(function(resolve) {
              console.log("in _applyAlpha qx.Promise, value=" + value);
              setTimeout(function() {
                console.log("in _applyAlpha resolving qx.Promise, value=" + value);
                resolve("xyz");
              }, 50);
            });
            console.log("in _applyAlpha, value=" + value + ", p=" + p);
            return p;
          },
          _applyBravo: function(value, oldValue) {
            return new qx.Promise(function(resolve) {
              setTimeout(function() {
                resolve("uvw");
              }, 50);
            });
          }
        }
      });

      function createObj(name) {
	      var obj = new Clazz().set({ value: name });
	      obj.addListener("changeAlphaAsync", function(evt) {
	        var value = evt.getData();
	      	var p = new qx.Promise(function(resolve) {
            console.log(name + ": changeAlphaAsync 1 in qx.Promise, value=" + value);
	      		setTimeout(function() {
	      			if (str.length)
	      				str += ",";
	      			str += name;
              console.log(name + ": changeAlphaAsync 1 resolving qx.Promise, value=" + value);
	      			resolve();
	      		}, 200);
	      	}).then(function() {
            console.log(name + ": changeAlphaAsync 1 resolved qx.Promise, value=" + value);
	      	});
          console.log(name + ": changeAlphaAsync 1, value=" + value + ", p=" + p);
	      	return p;
	      });
	      return obj;
      }

      var objOne = createObj("one");
      var objTwo = createObj("two");

      var str = "";
      objOne.addListener("changeAlphaAsync", function(evt) {
        var value = evt.getData();
      	console.log("objOne.alphaAsync setting, value=" + value);
      	return objTwo.setAlphaAsync("def").then(function() {
      		str += "xxx";
      		console.log("objOne.alphaAsync done, value=" + value);
      	});
      });

      console.log("objOne.alphaAsync going to set value=abc");
      objOne.setAlphaAsync("abc").then(function() {
        console.log("objOne.alphaAsync completed set value=abc");
      	this.assertEquals("one,twoxxx", str);
      	qx.Class.undefine("testAsyncEventHandlers.Clazz");
      	this.resume();
      }, this);
      this.wait(2500);
    },

    /**
     * Tests using bind() on async properties (using the "changeXxxAsync" events) between
     * a series of objects.  The test must show that the property values are fired in
     * order, and that if an async event handler returns a promise it defers bind from
     * propagating onto other objects.
     */
    testWaterfallBinding: function() {
    	var t = this;
      var Clazz = qx.Class.define("testWaterfallBinding.Clazz", {
        extend: qx.core.Object,
        properties: {
        	value: {

        	},
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
          	var t = this;
          	console.log("pre applyAlpha[" + t.getValue() + "] = " + value);
            return new qx.Promise(function(resolve) {
              setTimeout(function() {
              	console.log("applyAlpha[" + t.getValue() + "] = " + value);
                resolve("xyz");
              }, 50);
            });
          }
        }
      });
      var objs = [];
      var str = "";

      function trap(i) {
      	var obj = new Clazz().set({value: i});
      	var bindPromise;
      	if (i > 0) {
      		bindPromise = objs[i - 1].bindAsync("alphaAsync", obj, "alphaAsync");
      	} else {
      		bindPromise = qx.Promise.resolve(true);
      	}
      	return bindPromise.then(function() {
        	obj.addListener("changeAlpha", function(evt) {
        		var obj = evt.getTarget();
        		var data = evt.getData();
        		var delay = (5-i+1) * 100;
        		console.log("pre changeAlpha " + obj.getValue() + " = " + data + " after " + delay);

        		return new qx.Promise(function(resolve) {
        			setTimeout(function() {
        				if (str.length)
        					str += ",";
            		str += obj.getValue() + ":" + data;
            		console.log("changeAlpha " + obj.getValue() + " = " + data + " after " + delay);
            		resolve();
        			}, delay);
        		});
        	}, this);
        	objs[i] = obj;
      	});
      }

      qx.Promise.mapSeries([0, 1, 2, 3, 4], trap)
      	.then(function() {
          var p = objs[0].setAlphaAsync("abc");

          p.then(function() {
            t.assertEquals("0:abc,1:abc,2:abc,3:abc,4:abc", str);
            qx.Class.undefine("testWaterfallBinding.Clazz");
          	t.resume();
          }, t);

      	});

      this.wait(10000);
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
    },

    /**
     * Tests binding where the context is static class
     */
    testBindingToStatic: function() {
      var t = this;
      qx.Promise.resolve(true).then(function() {
        qx.core.Assert.assertIdentical(qx.Promise, this);
        t.resume();
      }, qx.Promise);
      this.wait(1000);
    },

    /**
     * Tests the context parameter for qx.Promise.resolve
     */
    testBindingResolve: function() {
      var t = this;
      qx.Promise.resolve(true, this).then(function() {
        qx.core.Assert.assertIdentical(t, this);
        t.resume();
      });
      this.wait(1000);
    },

    /**
     * Tests the context parameter for qx.Promise.reject
     */
    testBindingReject: function() {
      var t = this;
      qx.Promise.reject(new Error("Dummy Error"), this).catch(function() {
        qx.core.Assert.assertIdentical(t, this);
        t.resume();
      });
      this.wait(1000);
    },

    /**
     * Tests wrapping of parameters preserves the original values
     */
    testWrapping: function() {
      var t = this;
      new qx.Promise(function(resolve) {
        resolve();
	    })
	    .then(function() {
	        return qx.Promise.all(["foo", new qx.data.Array(["a", "b", "c"])]);
	    })
	    .spread(function(str, arr) {
	        t.assertEquals(str, "foo");
	        t.assertInstance(arr, qx.data.Array);
	        t.assertEquals(arr.join(""), "abc");
	        t.resume();
	    });
      this.wait(1000);
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
