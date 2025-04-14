qx.Class.define("qx.test.Promise", {
  extend: qx.dev.unit.TestCase,

  members: {
    /**
     * Tests the isPromise method
     */
    testIsPromise() {
      var p = new qx.Promise(function () {});
      this.assertTrue(qx.Promise.isPromise(p));
      this.assertFalse(qx.Promise.isPromise(null));
      this.assertFalse(qx.Promise.isPromise({}));
      this.assertTrue(qx.Promise.isPromise(qx.Promise.resolve()));
      this.assertTrue(qx.Promise.isPromise(Promise.resolve()));
      this.assertTrue(qx.Promise.isPromise({ then: function () {} }));
    },
    /**
     * Tests a new promise that resolves with no errors
     */
    testNewPromise() {
      var self = this;
      var p = new qx.Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve("ok");
        });
      }, this);
      p.then(
        function (value) {
          this.assertIdentical(this, self);
          this.assertEquals(value, "ok");
          this.resume();
        },
        function (err) {
          this.assertTrue(false);
          this.resume();
        }
      );

      this.wait(1000);
    },

    /**
     * Tests a new promise that is rejected
     */
    testReject() {
      var self = this;
      var p = new qx.Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error("oops"));
        });
      }, this);
      p.then(
        function (value) {
          this.assertTrue(false);
          this.resume();
        },
        function (err) {
          this.assertIdentical(this, self);
          this.assertEquals(err.message, "oops");
          this.resume();
        }
      );

      this.wait(1000);
    },

    /**
     * Tests promise being rejected externally using `reject` method
     * Also tests binding catch
     */
    testExternalReject() {
      var promise = new qx.Promise();
      promise.catch(function (e) {
        this.assertEquals("oops", e.message);
        setTimeout(() => this.resume(), 1);
      }, this);
      promise.reject(new Error("oops"));
      this.wait(1000);
    },

    /**
     * Tests that cancelling promise will cause `then` and `catch` to not be called
     * (finally must be called)
     */
    testCancel1() {
      if (qx.core.Environment.get("qx.Promise.useNativePromise")) {
        console.warn(
          "Skipping test because the native promise implementation of qx.Promise does not support cancellation"
        );
        return;
      } else {
        let promise = new qx.Promise((resolve, reject) => {
          setTimeout(() => {
            resolve();
          }, 500);
        });
        promise
          .then(() => this.fail("Should not call!"))
          .then(() => this.fail("Should not call!"));

        promise.catch(() => {
          this.fail("Should not call!");
        });

        let output = "";

        promise
          .then(
            () => new qx.Promise((resolve, reject) => reject(new Error("oops")))
          )
          .catch(() => this.fail("Should not call!"))
          .finally(() => {
            output += "1";
          })
          .then(() => {
            this.fail("Should not call!");
          });

        let f = promise.finally(() => {
          setTimeout(() => {
            output += "2";
            this.assertEquals("12", output);
            this.resume();
          }, 100);
        });
        this.assertInstance(f, qx.Promise);
        promise.cancel();
        this.wait(1000);
      }
    },

    /**
     * Ensures that non of the handlers in the chain are called when a promise is cancelled immediately
     */
    testCancel2() {
      if (qx.core.Environment.get("qx.Promise.useNativePromise")) {
        console.warn(
          "Skipping test because the native promise implementation of qx.Promise does not support cancellation"
        );
        return;
      } else {
        let output = "";
        let promise = qx.Promise.resolve()
          .then(
            () =>
              new qx.Promise(resolve => {
                output += "1";
                setTimeout(resolve, 100);
              })
          )
          .then(
            () =>
              new qx.Promise(resolve => {
                output += "2";
                setTimeout(resolve, 100);
              })
          )
          .then(
            () =>
              new qx.Promise(resolve => {
                output += "3";
                setTimeout(resolve, 100);
              })
          )
          .finally(() => {
            this.assertEquals("", output);
            this.resume();
          });

        promise.cancel();
        this.wait(1000);
      }
    },

    /**
     * Ensures that the promise chain does not continue after a promise is cancelled, except ALL the `finally` calls
     * which are both ancestors and descendants of the cancelled promise, which have not been called yet.
    
     */
    testCancel3() {
      if (qx.core.Environment.get("qx.Promise.useNativePromise")) {
        console.warn(
          "Skipping test because the native promise implementation of qx.Promise does not support cancellation"
        );
        return;
      } else {
        let output = "";
        let promise = qx.Promise.resolve()
          .then(
            () =>
              new qx.Promise(resolve => {
                output += "1";
                setTimeout(resolve, 100);
              })
          )
          .then(
            () =>
              new qx.Promise(resolve => {
                output += "2";
                setTimeout(resolve, 100);
                setTimeout(() => promise.cancel(), 150);
              })
          )
          .finally(() => {
            if (output.at(-1) !== "2") {
              this.fail("finally called twice!");
            }
            output += "3";
          })
          .then(
            () =>
              new qx.Promise(resolve => {
                output += "4";
                setTimeout(resolve, 100);
              })
          )
          .then(
            () =>
              new qx.Promise(resolve => {
                this.fail("Should not call!");
              })
          )
          .finally(() => {
            output += "5";
          })
          .then(() => this.fail("should not call!"))
          .finally(() => {
            output += "6";
          });

        let promise2 = promise
          .then(() => this.fail("should not call!"))
          .finally(() => {
            output += "7";
          })
          .then(() => this.fail("should not call!"))
          .finally(() => {
            output += "8";
            this.assertEquals("12345678", output);
            this.resume();
          });

        this.wait(1000);
      }
    },

    /**
     * Tests that cancelling a promise will not stop its chain from executing if there are promises which depend on some stages in the chain
     */
    testCancel4() {
      if (qx.core.Environment.get("qx.Promise.useNativePromise")) {
        console.warn(
          "Skipping test because the native promise implementation of qx.Promise does not support cancellation"
        );
        return;
      } else {
        let output = "";
        let promise1 = qx.Promise.resolve().then(() => {
          output += "1";
        });

        let branch1 = promise1.then(() => {
          output += "2";
        });
        let branch2 = promise1
          .then(() => (output += "3"))
          .finally(() => {
            setTimeout(() => {
              this.assertEquals("13", output);
              this.resume();
            }, 100);
          });

        branch1.cancel();
        this.wait(1000);
      }
    },

    /**
     * Ensures exception is thrown when trying to call `then` for a promise which has already been cancelled.
     */
    testThenAfterCancel() {
      if (qx.core.Environment.get("qx.Promise.useNativePromise")) {
        console.warn(
          "Skipping test because the native promise implementation of qx.Promise does not support cancellation"
        );
        return;
      } else {
        let promise = new qx.Promise((resolve, reject) => {
          setTimeout(() => {
            resolve();
          }, 300);
        });
        promise.cancel();
        promise
          .then(() => this.fail("Should not call!"))
          .catch(e => {
            this.assertEquals("late cancellation observer", e.message);
            setTimeout(this.resume(), 1);
          });

        this.wait(1000);
      }
    },

    /**
     * Ensures exception is thrown when trying to call `catch` for a promise which has already been cancelled.
     */
    testCatchAfterCancel() {
      if (qx.core.Environment.get("qx.Promise.useNativePromise")) {
        console.warn(
          "Skipping test because the native promise implementation of qx.Promise does not support cancellation"
        );
        return;
      } else {
        let promise = new qx.Promise((resolve, reject) => {
          setTimeout(() => {
            resolve();
          }, 300);
        });
        promise.cancel();
        promise
          .then(() => {
            this.fail("Should not call!");
          })
          .catch(e => {
            this.assertEquals("late cancellation observer", e.message);
            setTimeout(() => this.resume(), 1);
          });

        this.wait(1000);
      }
    },

    /**
     * Ensures exception is thrown when trying to call `finally` for a promise which has already been cancelled.
     */
    testFinallyAfterCancel() {
      if (qx.core.Environment.get("qx.Promise.useNativePromise")) {
        console.warn(
          "Skipping test because the native promise implementation of qx.Promise does not support cancellation"
        );
        return;
      } else {
        let promise = new qx.Promise((resolve, reject) => {
          setTimeout(() => {
            resolve();
          }, 300);
        });
        promise.cancel();
        promise
          .then(() => {
            this.fail("Should not call!");
          })
          .catch(e => {
            this.assertEquals("late cancellation observer", e.message);
            setTimeout(() => this.resume(), 1);
          });

        this.wait(1000);
      }
    },

    /**
     * Ensures a promise can still be cancelled after it has been settled
     */
    testCancelAfterSettled() {
      if (qx.core.Environment.get("qx.Promise.useNativePromise")) {
        console.warn(
          "Skipping test because the native promise implementation of qx.Promise does not support cancellation"
        );
        return;
      } else {
        let promise = qx.Promise.resolve();
        promise
          .then(() => {
            promise.cancel();
          })
          .then(() => {
            setTimeout(() => this.resume(), 1);
          });

        this.wait(1000);
      }
    },

    /**
     * Ensures that `finally` is run when the promise rejects
     */
    testCatchFinally() {
      var caughtException = null;
      var t = this;
      qx.Promise.resolve()
        .then(function () {
          throw new Error("oops");
        })
        .catch(function (ex) {
          caughtException = ex;
        })
        .finally(function () {
          this.assertNotNull(caughtException);
          this.assertIdentical(this, t);
          setTimeout(() => this.resume(), 1);
        }, this);
      this.wait(1000);
    },

    /**
     * Tests that the `promisify` method works for operations functions.
     * Also ensures the return value of `.then` is a qx.Promise
     */
    testPromisifyResolve() {
      function feedMe(fruit, callback) {
        setTimeout(function () {
          if (fruit == "raspberry") {
            callback(null, "That's nice");
          } else {
            callback(new Error("No thank you!"), null);
          }
        }, 100);
      }

      let feedMeAsync = qx.Promise.promisify(feedMe);

      feedMeAsync("raspberry").then(value => {
        this.assertEquals("That's nice", value);
        this.resume();
      });
      this.wait(1000);
    },

    /**
     * Tests that the `promisify` method works for unsuccessful operations
     */
    testPromisifyReject() {
      function feedMe(fruit, callback) {
        setTimeout(function () {
          if (fruit == "raspberry") {
            callback(null, "That's nice");
          } else {
            callback(new Error("No thank you!"), null);
          }
        }, 100);
      }

      let feedMeAsync = qx.Promise.promisify(feedMe);

      feedMeAsync("ping pong balls").catch(err => {
        this.assertEquals("No thank you!", err.message);
        this.resume();
      });
      this.wait(1000);
    },

    /**
     * Tests the qx.Promise.allOf method
     */
    testAllOf() {
      var t = this;
      var dt = new Date();
      var obj = {
        a: new qx.Promise(),
        b: new qx.Promise(),
        c: new qx.Promise(),
        d: "four",
        e: dt
      };

      let promise = qx.Promise.allOf(obj);
      this.assertInstance(promise, qx.Promise);
      promise.then(function (obj2) {
        t.assertTrue(obj === obj2);
        t.assertEquals("one", obj.a);
        t.assertEquals("two", obj.b);
        t.assertEquals("three", obj.c);
        t.assertEquals("four", obj.d);
        t.assertTrue(obj.e === dt);
        setTimeout(() => t.resume(), 1);
      });
      obj.a.then(function () {
        obj.b.resolve("two");
      });
      obj.b.then(function () {
        obj.c.resolve("three");
      });
      obj.a.resolve("one");
      t.wait(1000);
    },

    /**
     * Checks that if one of the promises in the allOf array rejects,
     * the overall result will reject
     */
    testAllOfReject() {
      var t = this;
      var obj = {
        a: new qx.Promise(),
        b: new qx.Promise()
      };

      qx.Promise.allOf(qx.Promise.resolve(obj)).catch(function (reason) {
        t.assertEquals("two", reason.message);
        setTimeout(() => t.resume(), 1);
      });

      obj.b.reject(new Error("two"));
      obj.a.resolve("one");
      t.wait(1000);
    },

    /**
     * Tests the qx.Promise.allOf being passed a promise of an object instead of a straight value
     */
    testAllOfPromiseObj() {
      var t = this;
      var obj = {
        a: new qx.Promise(),
        b: new qx.Promise()
      };

      qx.Promise.allOf(qx.Promise.resolve(obj)).then(function (obj2) {
        t.assertTrue(obj === obj2);
        t.assertEquals("one", obj.a);
        t.assertEquals("two", obj.b);

        setTimeout(() => t.resume(), 1);
      });
      obj.a.then(function () {
        obj.b.resolve("two");
      });
      obj.a.resolve("one");
      t.wait(1000);
    },

    /**
     * Tests that setting a property value with a promise will delay setting the
     * value until the promise is resolved.  In this case, the property is *not*
     * marked as async and the setXxx method is used
     */
    testPropertySetValueAsPromise1() {
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
      var p = new qx.Promise(function (resolve) {
        resolve(123);
      });
      obj.setAlpha(p);
      p.then(function () {
        t.assertEquals(123, obj.getAlpha());
        qx.Class.undefine("testPropertySetValueAsPromise1.Clazz");
        setTimeout(() => t.resume(), 1);
      });
      this.wait(1000);
    },

    /**
     * Tests that setting a property value with a promise will delay setting the
     * value until the promise is resolved.  In this case, the property *is*
     * marked as async and the setXxxAsync method is used to test chaining
     */
    testPropertySetValueAsPromise2() {
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
      var p = new qx.Promise(function (resolve) {
        resolve(123);
      });
      obj.setAlphaAsync(p).then(function () {
        t.assertEquals(123, obj.getAlpha());
        qx.Class.undefine("testPropertySetValueAsPromise2.Clazz");
        setTimeout(() => t.resume(), 1);
      });
      this.wait(1000);
    },

    /**
     * Tests that a property apply method can return a promise; in this case, the
     * property is not marked as async so the apply method is only able to delay
     * the event handler
     */
    testPropertySetValueAsyncApply1() {
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
          _applyAlpha(value, oldValue) {
            return (p = new qx.Promise(function (resolve) {
              setTimeout(function () {
                resolve("xyz");
              }, 250);
            }));
          }
        }
      });

      var obj = new Clazz();
      var eventFired = 0;
      obj.addListener("changeAlpha", function (evt) {
        eventFired++;
      });
      obj.setAlpha("abc");
      this.assertTrue(!!p);
      this.assertEquals(0, eventFired);
      this.assertEquals("abc", obj.getAlpha());
      p.then(function (value) {
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
    testPropertySetValueAsyncApply2() {
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
          _applyAlpha(value, oldValue) {
            return new qx.Promise(function (resolve) {
              setTimeout(function () {
                resolve("xyz");
              }, 250);
            });
          }
        }
      });

      var obj = new Clazz();
      var eventFired = 0;
      obj.addListener("changeAlpha", function (evt) {
        eventFired++;
      });
      var p = obj.setAlphaAsync("abc");
      this.assertEquals(0, eventFired);
      p.then(function (value) {
        this.assertEquals("abc", value);
        this.assertEquals("abc", obj.getAlpha());
        this.assertEquals(1, eventFired);

        // Set the same value, should return a new promise but not fire an event
        p = obj.setAlphaAsync("abc");
        p.then(function (value) {
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
    testPropertySetValueAsyncApply3() {
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

    testBinding() {
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
          _applyAlpha(value, oldValue) {
            return new qx.Promise(function (resolve) {
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
      var asyncToSync = new qx.Promise(function (resolve) {
        var asyncObj = new AsyncClazz();
        var syncObj = new SyncClazz();

        var p1 = new qx.Promise();
        asyncObj.addListenerOnce("changeAlphaAsync", evt => {
          var data = evt.getData();
          this.assertTrue(data instanceof qx.Promise);
          p1.resolve();
        });

        var p2 = new qx.Promise();
        var bravoEvents = 0;
        var id = syncObj.addListener("changeBravo", evt => {
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
        });

        asyncObj.getAlphaAsync();
        asyncObj.bind("alphaAsync", syncObj, "bravo");
        asyncObj.setAlphaAsync("zyx");
        qx.Promise.all([p1, p2]).then(function () {
          var p3 = new qx.Promise();
          syncObj.addListenerOnce("changeBravo", evt => {
            var data = evt.getData();
            this.assertEquals("wvu", data);
            p3.resolve();
          });

          asyncObj.setAlphaAsync("wvu");
          p3.then(function () {
            this.resume();
          }, this);
        }, this);
      }, this);

      /*
       * Test binding a "normal" sync property to an async property
       */
      asyncToSync.then(function () {
        var asyncObj = new AsyncClazz();
        var syncObj = new SyncClazz();

        var p1 = new qx.Promise();
        asyncObj.addListenerOnce("changeAlphaAsync", evt => {
          var data = evt.getData();
          this.assertEquals("def", data);
          p1.resolve();
        });

        syncObj.bind("bravo", asyncObj, "alphaAsync");
        syncObj.setBravo("def");

        p1.then(function () {
          var p2 = new qx.Promise();
          asyncObj.addListenerOnce("changeAlphaAsync", evt => {
            var data = evt.getData();
            this.assertEquals("ghi", data);
            p2.resolve();
          });

          syncObj.setBravo("ghi");
          return p2.then(function () {
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
    testAsyncEventHandlers() {
      var Clazz = qx.Class.define("testAsyncEventHandlers.Clazz", {
        extend: qx.core.Object,
        properties: {
          value: {},

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
          _applyAlpha(value, oldValue) {
            var p = new qx.Promise(function (resolve) {
              console.log("in _applyAlpha qx.Promise, value=" + value);
              setTimeout(function () {
                console.log(
                  "in _applyAlpha resolving qx.Promise, value=" + value
                );

                resolve("xyz");
              }, 50);
            });
            console.log("in _applyAlpha, value=" + value + ", p=" + p);
            return p;
          },
          _applyBravo(value, oldValue) {
            return new qx.Promise(function (resolve) {
              setTimeout(function () {
                resolve("uvw");
              }, 50);
            });
          }
        }
      });

      function createObj(name) {
        var obj = new Clazz().set({ value: name });
        obj.addListener("changeAlphaAsync", function (evt) {
          var value = evt.getData();
          var p = new qx.Promise(function (resolve) {
            console.log(
              name + ": changeAlphaAsync 1 in qx.Promise, value=" + value
            );

            setTimeout(function () {
              if (str.length) {
                str += ",";
              }
              str += name;
              console.log(
                name +
                  ": changeAlphaAsync 1 resolving qx.Promise, value=" +
                  value
              );

              resolve();
            }, 200);
          }).then(function () {
            console.log(
              name + ": changeAlphaAsync 1 resolved qx.Promise, value=" + value
            );
          });
          console.log(
            name + ": changeAlphaAsync 1, value=" + value + ", p=" + p
          );

          return p;
        });
        return obj;
      }

      var objOne = createObj("one");
      var objTwo = createObj("two");

      var str = "";
      objOne.addListener("changeAlphaAsync", function (evt) {
        var value = evt.getData();
        console.log("objOne.alphaAsync setting, value=" + value);
        return objTwo.setAlphaAsync("def").then(function () {
          str += "xxx";
          console.log("objOne.alphaAsync done, value=" + value);
        });
      });

      console.log("objOne.alphaAsync going to set value=abc");
      objOne.setAlphaAsync("abc").then(function () {
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
    testWaterfallBinding() {
      var t = this;
      var Clazz = qx.Class.define("testWaterfallBinding.Clazz", {
        extend: qx.core.Object,
        properties: {
          value: {},

          alpha: {
            init: null,
            nullable: true,
            async: true,
            apply: "_applyAlpha",
            event: "changeAlpha"
          }
        },

        members: {
          _applyAlpha(value, oldValue) {
            var t = this;
            console.log("pre applyAlpha[" + t.getValue() + "] = " + value);
            return new qx.Promise(function (resolve) {
              setTimeout(function () {
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
        var obj = new Clazz().set({ value: i });
        var bindPromise;
        if (i > 0) {
          bindPromise = objs[i - 1].bindAsync("alphaAsync", obj, "alphaAsync");
        } else {
          bindPromise = qx.Promise.resolve(true);
        }
        return bindPromise.then(function () {
          obj.addListener("changeAlpha", evt => {
            var obj = evt.getTarget();
            var data = evt.getData();
            var delay = (5 - i + 1) * 100;
            console.log(
              "pre changeAlpha " +
                obj.getValue() +
                " = " +
                data +
                " after " +
                delay
            );

            return new qx.Promise(function (resolve) {
              setTimeout(function () {
                if (str.length) {
                  str += ",";
                }
                str += obj.getValue() + ":" + data;
                console.log(
                  "changeAlpha " +
                    obj.getValue() +
                    " = " +
                    data +
                    " after " +
                    delay
                );

                resolve();
              }, delay);
            });
          });

          objs[i] = obj;
        });
      }

      qx.Promise.mapSeries([0, 1, 2, 3, 4], trap).then(function () {
        var p = objs[0].setAlphaAsync("abc");

        p.then(function () {
          t.assertEquals("0:abc,1:abc,2:abc,3:abc,4:abc", str);
          qx.Class.undefine("testWaterfallBinding.Clazz");
          t.resume();
        }, t);
      });

      this.wait(10000);
    },

    /**
     * Tests the each method of promise, using qx.data.Array which the native Promise
     * does not understand.  The values are scalar values
     */
    testEach1() {
      var t = this;
      var arr = new qx.data.Array();
      arr.push("a");
      arr.push("b");
      arr.push("c");
      var str = "";
      var promise = qx.Promise.resolve(arr);
      var forEachReturn = promise.forEach(function (item) {
        str += item;
        this.assertIdentical(t, this);
      }, this);
      forEachReturn.then(function () {
        t.assertEquals("abc", str);
        setTimeout(() => t.resume(), 1);
      });
      this.assertInstance(forEachReturn, qx.Promise);
      t.wait(1000);
    },

    /**
     * Tests the each method of promise, using qx.data.Array which the native Promise
     * does not understand.  The values are a mixture of promises and scalar values
     */
    testEach2() {
      var t = this;
      var arr = new qx.data.Array();
      arr.push(
        new qx.Promise(function (resolve) {
          setTimeout(function () {
            resolve("a");
          }, 500);
        })
      );

      arr.push(
        new qx.Promise(function (resolve) {
          setTimeout(function () {
            resolve("b");
          }, 300);
        })
      );

      arr.push(
        new qx.Promise(function (resolve) {
          setTimeout(function () {
            resolve("c");
          }, 100);
        })
      );

      arr.push("d");
      arr.push("e");
      var str = "";
      var promise = qx.Promise.resolve(arr);
      this.assertInstance(promise, qx.Promise);
      var pEach = promise.forEach(function (item) {
        str += item;
      });
      this.assertInstance(pEach, qx.Promise);
      var pThen = pEach.then(function () {
        t.assertEquals("abcde", str);
        t.resume();
      });
      this.assertInstance(pThen, qx.Promise);
      t.wait(1000);
    },

    /**
     * Checks that the each method will reject if one of the promises in the array rejects
     */
    testEachReject() {
      let arr = [qx.Promise.resolve("a"), qx.Promise.reject(new Error("b"))];

      var str = "";
      var promiseArr = qx.Promise.resolve(arr);
      var pEach = qx.Promise.forEach(promiseArr, function (item) {
        str += item;
      });
      pEach.catch(reason => {
        this.assertEquals("b", reason.message);
        setTimeout(() => this.resume(), 1);
      });
      this.wait(1000);
    },

    /**
     * Tests the `each` method being passed with a promise of an array,
     * not a straight array
     */
    testEachPromiseArray() {
      var promiseArr = qx.Promise.resolve([1, 2, 3]);

      qx.Promise.forEach(promiseArr, (item, index) => {
        this.assertEquals(index, item - 1);
      }).then(result => {
        setTimeout(() => this.resume(), 1);
      });
      this.wait(1000);
    },

    /**
     * Tests unhandled rejections being passed to the global error handler
     */
    testGlobalError() {
      var t = this;
      qx.event.GlobalError.setErrorHandler(function (ex) {
        t.assertEquals(ex.message, "oops");
        qx.event.GlobalError.setErrorHandler(null);
        t.resume();
      });
      var self = this;
      var p = new qx.Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve("ok");
        });
      }, this);
      p.then(function (value) {
        throw new Error("oops");
      });
      this.wait(1000);
    },

    /**
     * Tests promisification of methods
     */
    testMethod() {
      var t = this;
      var fn = qx.Promise.method(function (value) {
        return value;
      });
      var promise = fn("yes");
      this.assertInstance(promise, qx.Promise);
      promise.then(function (value) {
        t.assertEquals(value, "yes");
        setTimeout(() => t.resume(), 1);
      });
      this.wait(1000);
    },

    /**
     * Tests binding of all callbacks via .bind()
     */
    testBinding1() {
      var t = this;
      var p = qx.Promise.resolve("hello").bind(this);
      p.then(function (value) {
        qx.core.Assert.assertIdentical(t, this);
        setTimeout(() => this.resume(), 1);
      });
      this.wait(1000);
    },

    /**
     * Tests binding on a per-method basis
     */
    testBinding2() {
      var t = this;
      var p = qx.Promise.forEach(
        ["a", "b", "c"],
        function (item) {
          qx.core.Assert.assertIdentical(t, this);
        },
        this
      ).then(function (value) {
        qx.core.Assert.assertIdentical(t, this);
        setTimeout(() => this.resume(), 1);
      }, this);
      this.wait(1000);
    },

    testMarshal() {
      var marshal = new qx.data.marshal.Json();
      marshal.toClass(qx.test.Promise.TEST_MODEL.children[0], true);
      var model = marshal.toModel(qx.test.Promise.TEST_MODEL.children[0]);
    },

    /**
     * Tests binding where the context is static class
     */
    testBindingToStatic() {
      var t = this;
      qx.Promise.resolve(true).then(function () {
        qx.core.Assert.assertIdentical(qx.Promise, this);
        setTimeout(() => t.resume(), 1);
      }, qx.Promise);
      this.wait(1000);
    },

    /**
     * Tests the context parameter for qx.Promise.resolve
     */
    testBindingResolve() {
      var t = this;
      qx.Promise.resolve(true, this).then(function () {
        qx.core.Assert.assertIdentical(t, this);
        setTimeout(() => this.resume(), 1);
      });
      this.wait(1000);
    },

    /**
     * Tests the context parameter for qx.Promise.reject
     */
    testBindingReject() {
      var t = this;
      qx.Promise.reject(new Error("Dummy Error"), this).catch(function () {
        qx.core.Assert.assertIdentical(t, this);
        setTimeout(() => this.resume(), 1);
      });
      this.wait(1000);
    },

    /**
     * Tests wrapping of parameters preserves the original values
     */
    testWrapping() {
      var t = this;
      new qx.Promise(function (resolve) {
        resolve();
      })
        .then(function () {
          return qx.Promise.all(["foo", new qx.data.Array(["a", "b", "c"])]);
        })
        .spread(function (str, arr) {
          t.assertEquals(str, "foo");
          t.assertInstance(arr, qx.data.Array);
          t.assertEquals(arr.join(""), "abc");
          setTimeout(() => t.resume(), 1);
        });
      this.wait(1000);
    },

    /**
     * Tests the `race` method when no promises in the array reject
     */
    testRaceResolve() {
      var promiseB = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve("b");
        }, 200);
      });
      var promiseC = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve("c");
        }, 100);
      });
      var promiseD = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve("d");
        }, 300);
      });
      var arr = [promiseB, promiseC, promiseD];
      let promise = qx.Promise.resolve(arr).race();
      promise.then(val => {
        this.assertEquals("c", val);
        this.resume();
      });
      this.assertInstance(promise, qx.Promise);
      this.wait(1000);
    },

    /**
     * Tests the `race` method when one promise in the array rejects
     */
    testRaceReject() {
      var promiseB = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve("b");
        }, 200);
      });
      var promiseC = new qx.Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error("c"));
        }, 100);
      });
      var arr = new qx.data.Array([promiseB, promiseC]);
      qx.Promise.resolve(arr)
        .race()
        .then(val => {
          this.fail("Should not resolve");
        })
        .catch(err => {
          this.assertEquals("c", err.message);
          this.resume();
        });

      this.wait(1000);
    },

    /**
     * Tests the `race` method when the array contains a straight (i.e. non-promise) value
     */
    testRaceStraightValue() {
      var promiseB = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve("b");
        }, 200);
      });
      var arr = ["a", promiseB];
      qx.Promise.race(qx.Promise.resolve(arr)).then(val => {
        this.assertEquals("a", val);
        setTimeout(() => this.resume(), 1);
      });

      this.wait(1000);
    },

    /**
     * Tests the `any` method when all promises in the array resolve
     */
    testAnyResolve() {
      var promiseB = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve("b");
        }, 200);
      });
      var promiseC = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve("c");
        }, 100);
      });
      var promiseD = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve("d");
        }, 300);
      });
      var arr = [promiseB, promiseC, promiseD];
      let promise = qx.Promise.resolve(arr).any();
      promise.then(val => {
        this.assertEquals("c", val);
        this.resume();
      });
      this.assertInstance(promise, qx.Promise);
      this.wait(1000);
    },

    /**
     * Tests the `any` method when one promise in the array rejects.
     * The overall result should the result of the first promise that resolves
     */
    testAnyOneReject() {
      var promiseB = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve("b");
        }, 200);
      });
      var promiseC = new qx.Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error("c"));
        }, 100);
      });
      var promiseD = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve("d");
        }, 300);
      });
      var arr = new qx.data.Array([promiseB, promiseC, promiseD]);
      qx.Promise.any(qx.Promise.resolve(arr)).then(val => {
        this.assertEquals("b", val);
        this.resume();
      });

      this.wait(1000);
    },

    /**
     * Tests the `any` method when all promises in the array reject.
     */
    testAnyAllReject() {
      var promiseB = new qx.Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error("b"));
        }, 200);
      });
      var promiseC = new qx.Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error("c"));
        }, 100);
      });
      var promiseD = new qx.Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error("d"));
        }, 300);
      });

      var arr = [promiseB, promiseC, promiseD];
      qx.Promise.resolve(arr)
        .any()
        .catch(aggErr => {
          this.resume();
        });

      this.wait(1000);
    },

    /**
     * Tests the `any` method when an empty array is passed in.
     */
    testAnyEmptyArray() {
      qx.Promise.resolve([])
        .any()
        .catch(aggErr => {
          setTimeout(() => this.resume(), 1);
        });

      this.wait(1000);
    },

    /**
     * Tests the `any` method when a straight (i.e. non-promise value) is passed in.
     * It should resolve to that value
     */
    testAnyStraightValue() {
      var promiseB = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve("b");
        }, 200);
      });
      var arr = ["a", promiseB];
      qx.Promise.resolve(arr)
        .any()
        .then(val => {
          this.assertEquals("a", val);
          setTimeout(() => this.resume(), 1);
        });

      this.wait(1000);
    },

    /**
     * Tests that `reduce` succeeds when no promise rejects
     */
    testReduceResolve() {
      var promiseB = qx.Promise.resolve(1);

      var promiseC = qx.Promise.resolve(2);
      var promiseD = qx.Promise.resolve(3);
      var arr = [promiseB, promiseC, promiseD];
      let promise = qx.Promise.resolve(arr).reduce(
        async (acc, item, index, length) => {
          this.assertEquals(index, item - 1);
          this.assertEquals(length, 3);
          return acc + item;
        },
        0
      );
      promise.then(result => {
        this.assertEquals(6, result);
        setTimeout(() => this.resume(), 1);
      });
      this.assertInstance(promise, qx.Promise);
      this.wait(1000);
    },

    /**
     * Tests that `reduce` rejects when one promise in the array rejects
     */
    testReduceOneReject() {
      var promiseB = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve(2);
        }, 200);
      });

      var promiseC = new qx.Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error("oops"));
        }, 100);
      });
      var promiseD = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve(4);
        }, 300);
      });
      var arr = new qx.data.Array([promiseB, promiseC, promiseD]);
      qx.Promise.reduce(
        qx.Promise.resolve(arr),
        async (acc, item) => acc + item,
        0
      ).catch(err => {
        this.assertEquals("oops", err.message);
        this.resume();
      });
      this.wait(1000);
    },

    /**
     * Tests that `reduce` rejects when the reducer function throws an error
     */
    testReduceMapperReject() {
      var promiseB = qx.Promise.resolve(2);
      var promiseC = qx.Promise.resolve(3);
      var promiseD = qx.Promise.resolve(4);
      var arr = [promiseB, promiseC, promiseD];
      qx.Promise.resolve(arr)
        .reduce(async (acc, item) => {
          throw new Error("oops");
        }, 0)
        .catch(err => {
          this.assertEquals("oops", err.message);
          setTimeout(() => this.resume(), 1);
        });
      this.wait(1000);
    },

    /**
     * Tests that `filter` succeeds when no promise rejects
     */
    testFilterResolve() {
      var promiseB = qx.Promise.resolve(2);
      var promiseC = qx.Promise.resolve(3);
      var promiseD = qx.Promise.resolve(4);
      var promiseE = qx.Promise.resolve(5);
      var arr = [promiseB, promiseC, promiseD, promiseE, 6];
      let t = this;
      let p = qx.Promise.resolve(arr).filter(async function (
        item,
        index,
        length
      ) {
        t.assertEquals(index, item - 2);
        t.assertEquals(5, length);
        t.assertIdentical(t, this);
        return item % 2 === 0;
      },
      this);
      p.then(evens => {
        this.assertArrayEquals([2, 4, 6], evens);
        //force resume to run on next tick so that we call resume after wait
        setTimeout(() => this.resume(), 1);
      });
      this.assertInstance(p, qx.Promise);
      this.wait(1000);
    },

    /**
     * Tests `concurrency` option for method `filter`
     */
    testFilterConcurrency() {
      let arr = new qx.data.Array([qx.Promise.resolve(1), 2, 3, 4]);

      let maxReached = false;
      let concurrency = 2;
      let running = 0;

      let t = this;

      qx.Promise.filter(
        qx.Promise.resolve(arr),
        async function (item) {
          running++;
          if (running > concurrency) {
            t.fail("Too many running tasks");
          } else if (running == concurrency) {
            maxReached = true;
          }
          await new Promise(resolve => setTimeout(resolve, 200));
          running--;
          return item % 2 === 0;
        },
        { concurrency }
      ).then(result => {
        this.assertTrue(maxReached);
        this.assertArrayEquals([2, 4], result);
        this.resume();
      });

      this.wait(1000);
    },

    /**
     * Tests that `filter` rejects when one promise in the array rejects
     */
    testFilterRejectValue() {
      var promiseB = qx.Promise.reject(new Error("oops"));

      var promiseC = qx.Promise.resolve(3);
      var promiseD = qx.Promise.resolve(4);
      var arr = [promiseB, promiseC, promiseD, 6];
      qx.Promise.resolve(arr)
        .filter(async (item, index, length) => item % 2 === 0)
        .catch(e => {
          this.assertEquals("oops", e.message);
          setTimeout(() => this.resume(), 1);
        });

      this.wait(1000);
    },

    /**
     * Tests that `filter` rejects when the iterator function throws an error
     */
    testFilterRejectFilterer() {
      var promiseB = qx.Promise.resolve(2);

      var promiseC = qx.Promise.resolve(3);
      var promiseD = qx.Promise.resolve(4);
      var arr = [promiseB, promiseC, promiseD, 6];
      qx.Promise.resolve(arr)
        .filter(async item => {
          throw new Error("oops");
        })
        .catch(e => {
          this.assertEquals("oops", e.message);
          setTimeout(() => this.resume(), 1);
        });

      this.wait(1000);
    },

    /**
     * Tests that the `some` method resolves when no promise rejects
     */
    testSomeResolve() {
      var promiseB = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve(2);
        }, 200);
      });

      var promiseC = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve(3);
        }, 100);
      });
      var promiseD = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve(4);
        }, 300);
      });
      var arr = [promiseB, promiseC, promiseD, 6];
      let p = qx.Promise.resolve(arr).some(2);
      p.then(result => {
        this.assertArrayEquals([6, 3], result);
        this.resume();
      });
      this.assertInstance(p, qx.Promise);
      this.wait(1000);
    },

    /**
     * Tests that the `some` method still resolves when one promise rejects
     * such that enough promises still resolve.
     * Also tests with a straight value in the array
     */
    testSomeOneReject() {
      var promiseB = new qx.Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error("oops"));
        }, 200);
      });

      var promiseC = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve(3);
        }, 100);
      });
      var promiseD = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve(4);
        }, 300);
      });
      var arr = new qx.data.Array([promiseB, promiseC, promiseD, 6]);
      qx.Promise.some(qx.Promise.resolve(arr), 3).then(result => {
        this.assertArrayEquals([6, 3, 4], result);
        this.resume();
      });
      this.wait(1000);
    },

    /**
     * Ensures that the `some` method rejects
     * when too many promises reject such that there aren't enough
     * resolved promises to satisfy the count
     */
    testSomeTooManyReject() {
      var promiseB = new qx.Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error("oops"));
        }, 200);
      });

      var promiseC = new qx.Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error("oops1"));
        }, 100);
      });
      var promiseD = new qx.Promise(function (resolve) {
        setTimeout(function () {
          resolve(4);
        }, 300);
      });
      var arr = [promiseB, promiseC, promiseD, 6];
      qx.Promise.resolve(arr)
        .some(3)
        .catch(error => {
          let errors = qx.lang.Type.isArray(error.errors)
            ? error.errors
            : error;

          this.assertArrayEquals(
            ["oops1", "oops"],
            errors.map(e => e.message)
          );
          this.resume();
        });
      this.wait(1000);
    },

    /**
     * Ensures that the `map` method resolves when no promise rejects
     */
    testMapResolve() {
      var promiseB = qx.Promise.resolve(2);

      var promiseC = qx.Promise.resolve(3);
      var promiseD = qx.Promise.resolve(4);
      var arr = [promiseB, promiseC, promiseD, 5];
      var t = this;
      let p = qx.Promise.resolve(arr).map(function (item, index, length) {
        t.assertEquals(index, item - 2);
        t.assertEquals(length, 4);
        this.assertIdentical(t, this);
        return item * 2;
      }, this);
      p.then(result => {
        this.assertArrayEquals([4, 6, 8, 10], result);
        setTimeout(() => this.resume(), 1);
      });
      this.assertInstance(p, qx.Promise);
      this.wait(1000);
    },

    /**
     * Tests the `concurrency` option of the `map` method
     */
    testMapConcurrency() {
      let promiseA = qx.Promise.resolve(1);
      let arr = new qx.data.Array([promiseA, 2, 3, 4]);

      let maxReached = false;
      let concurrency = 2;
      let running = 0;

      let t = this;

      let promise = qx.Promise.map(
        qx.Promise.resolve(arr),
        async function (item) {
          running++;
          if (running > concurrency) {
            t.fail("Too many running tasks");
          } else if (running == concurrency) {
            maxReached = true;
          }
          await new qx.Promise(resolve => setTimeout(resolve, 200));
          running--;
          return item * 2;
        },
        { concurrency }
      ).then(result => {
        this.assertTrue(maxReached);
        this.assertArrayEquals([2, 4, 6, 8], result);
        this.resume();
      });

      this.assertInstance(promise, qx.Promise);
      this.wait(1000);
    },

    /**
     * Tests the `map` method when one promise in the array rejects
     */
    testMapOneReject() {
      var promiseB = qx.Promise.resolve(2);

      var promiseC = qx.Promise.reject(new Error("oops"));
      var promiseD = qx.Promise.resolve(4);
      var arr = [promiseB, promiseC, promiseD];
      qx.Promise.resolve(arr)
        .map(async item => item * 2)
        .catch(err => {
          this.assertEquals("oops", err.message);
          setTimeout(() => this.resume(), 1);
        });
      this.wait(1000);
    },

    /**
     * Tests the `map` method rejects when the iterator (mapper) function rejects.
     */
    testMapMapperReject() {
      var promiseB = qx.Promise.resolve(2);

      var promiseC = qx.Promise.resolve(3);
      var promiseD = qx.Promise.resolve(4);
      var arr = [promiseB, promiseC, promiseD];
      qx.Promise.resolve(arr)
        .map(async item => {
          throw new Error("oops");
        })
        .catch(err => {
          this.assertEquals("oops", err.message);
          setTimeout(() => this.resume(), 1);
        });
      this.wait(1000);
    },

    /**
     * Ensures the `mapSeries` method resolves when no promise rejects.
     * Also tests custom context for the iterator function
     */
    testMapSeriesResolve() {
      var promiseB = qx.Promise.resolve(1);
      var promiseC = qx.Promise.resolve(2);
      var promiseD = qx.Promise.resolve(3);

      let checkIndex = 0;

      var arr = [promiseB, promiseC, promiseD, 4];
      let p = qx.Promise.resolve(arr).mapSeries(async (item, index, length) => {
        this.assertEquals(checkIndex++, index);
        this.assertEquals(4, length);
        return item * 2;
      });
      p.then(doubles => {
        this.assertArrayEquals([2, 4, 6, 8], doubles);
        setTimeout(() => this.resume(), 1);
      });
      this.assertInstance(p, qx.Promise);
      this.wait(1000);
    },

    /**
     * Tests the `mapSeries` method when one promise in the array rejects.
     * The returned promise should reject.
     */
    testMapSeriesOneReject() {
      var promiseB = qx.Promise.reject(new Error("oops"));
      var promiseC = qx.Promise.resolve(2);
      var promiseD = qx.Promise.resolve(3);

      var arr = [promiseB, promiseC, promiseD];
      qx.Promise.resolve(arr)
        .mapSeries(async item => item * 2)
        .catch(e => {
          this.assertEquals("oops", e.message);
          setTimeout(() => this.resume(), 1);
        });

      this.wait(1000);
    },

    /**
     * Tests the `mapSeries` method when the iterator rejects.
     * The returned promise should reject.
     */
    testMapSeriesMapperReject() {
      var promiseB = qx.Promise.resolve(2);
      var promiseC = qx.Promise.resolve(3);
      var promiseD = qx.Promise.resolve(4);
      var arr = [promiseB, promiseC, promiseD];
      qx.Promise.resolve(arr)
        .mapSeries(async item => {
          throw new Error("oops");
        })
        .catch(err => {
          this.assertEquals("oops", err.message);
          setTimeout(() => this.resume(), 1);
        });
      this.wait(1000);
    },

    /**
     * Tests the `mapSeries` being passed with the promise of the array,
     * which is also a qx.data.Array, which the native Promise does not understand
     */
    testMapSeriesPromiseArray() {
      var promiseArr = qx.Promise.resolve(new qx.data.Array([1, 2, 3]));

      qx.Promise.mapSeries(promiseArr, (item, index) => {
        this.assertEquals(index, item - 1);
        return item * 2;
      }).then(result => {
        setTimeout(() => this.resume(), 1);
      });
      this.wait(1000);
    }
  },

  statics: {
    TEST_MODEL: {
      name: "qx",
      children: [
        {
          name: "test",
          children: [
            {
              name: "Class",
              children: [
                {
                  name: "test: instantiate class in defer and access property"
                },

                {
                  name: "testAbstract"
                },

                {
                  name: "testAnonymous"
                }
              ]
            },

            {
              name: "Bootstrap",
              children: [
                {
                  name: "test: define bootstrap class, which extends 'Error'"
                },

                {
                  name: "test: define class with constructor"
                },

                {
                  name: "test: extend from Bootstrap class"
                }
              ]
            }
          ]
        }
      ]
    }
  }
});
