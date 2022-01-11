/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * *********************************************************************** */

const { promisify } = require("util");
const nodePromisify = promisify;
const PromisePool = require("es6-promise-pool");

qx.Class.define("qx.tool.utils.Promisify", {
  statics: {
    MAGIC_KEY: "__isPromisified__",
    IGNORED_PROPS:
      /^(?:promises|length|name|arguments|caller|callee|prototype|__isPromisified__)$/,

    promisifyAll(target, fn) {
      Object.getOwnPropertyNames(target).forEach(key => {
        if (this.IGNORED_PROPS.test(key) || (fn && fn(key, target) === false)) {
          return;
        }
        if (typeof target[key] !== "function") {
          return;
        }
        if (this.isPromisified(target[key])) {
          return;
        }

        var promisifiedKey = key + "Async";

        target[promisifiedKey] = this.promisify(target[key]);

        [key, promisifiedKey].forEach(key => {
          Object.defineProperty(target[key], this.MAGIC_KEY, {
            value: true,
            configurable: true,
            enumerable: false,
            writable: true
          });
        });
      });

      return target;
    },

    isPromisified(fn) {
      try {
        return fn[this.MAGIC_KEY] === true;
      } catch (e) {
        return false;
      }
    },

    promisify(fn, context) {
      fn = nodePromisify(fn);
      if (context) {
        fn = fn.bind(context);
      }
      return fn;
    },

    async poolEachOf(arr, size, fn) {
      let index = 0;
      let pool = new PromisePool(() => {
        if (index >= arr.length) {
          return null;
        }
        let item = arr[index++];
        return fn(item);
      }, 10);
      await pool.start();
    },

    async map(arr, fn) {
      return await qx.Promise.all(arr.map(fn));
    },

    async some(arr, fn) {
      return await new qx.Promise((resolve, reject) => {
        let count = 0;
        arr.forEach((...args) => {
          qx.Promise.resolve(fn(...args)).then(result => {
            count++;
            if (result && resolve) {
              resolve(true);
              resolve = null;
            }
            if (count == arr.length && resolve) {
              resolve(false);
            }
            return null;
          });
        });
      });
    },

    async someEach(arr, fn) {
      let index = 0;
      const next = () => {
        if (index >= arr.length) {
          return qx.Promise.resolve(false);
        }
        let item = arr[index++];
        return qx.Promise.resolve(fn(item)).then(result => {
          if (result) {
            return true;
          }
          return next();
        });
      };
      return await next();
    },

    async somePool(arr, size, fn) {
      return await new qx.Promise((resolve, reject) => {
        let index = 0;
        let pool = new PromisePool(() => {
          if (!resolve) {
            return null;
          }
          if (index >= arr.length) {
            resolve(false);
            return null;
          }
          let item = arr[index++];
          return fn(item).then(result => {
            if (result && resolve) {
              resolve(true);
              resolve = null;
            }
          });
        }, 10);
        pool.start();
      });
    },

    call(fn) {
      return new Promise((resolve, reject) => {
        fn((err, ...args) => {
          if (err) {
            reject(err);
          } else {
            resolve(...args);
          }
        });
      });
    },

    callback(promise, cb) {
      if (cb) {
        promise = promise
          .then((...args) => cb(null, ...args))
          .catch(err => cb(err));
      }
      return promise;
    },

    fs: null,

    each(coll, fn) {
      return qx.tool.utils.Promisify.eachOf(coll, fn);
    },

    forEachOf(coll, fn) {
      return qx.tool.utils.Promisify.eachOf(coll, fn);
    },

    eachOf(coll, fn) {
      let promises = Object.keys(coll).map(key => fn(coll[key], key));
      return qx.Promise.all(promises);
    },

    eachSeries(coll, fn) {
      return qx.tool.utils.Promisify.eachOfSeries(coll, fn);
    },

    forEachOfSeries(coll, fn) {
      return qx.tool.utils.Promisify.eachOfSeries(coll, fn);
    },

    eachOfSeries(coll, fn) {
      let keys = Object.keys(coll);
      let index = 0;
      function next() {
        if (index == keys.length) {
          return qx.Promise.resolve();
        }
        let key = keys[index];
        index++;
        var result = fn(coll[key], key);
        return qx.Promise.resolve(result).then(next);
      }
      return next();
    }
  },

  defer(statics) {
    statics.fs = statics.promisifyAll(require("fs"), function (key, fs) {
      return key !== "SyncWriteStream";
    });
  }
});
