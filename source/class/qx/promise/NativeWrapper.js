/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 Zenesis Limited, http://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
 * John Spackman (john.spackman@zenesis.com)
 * Patryk Malinowski (pmalinowski@vmn.digital)

 ************************************************************************ */

/**
 * Wrapper around a native promise, adding some extra helpful methods which are found in Bluebird.js,
 * such as .map, .reduce, .filter, and many more.
 *
 * @ignore(AggregateError)
 */
qx.Class.define("qx.promise.NativeWrapper", {
  extend: qx.core.Object,

  /**
   * @overload
   * @param {(resolve: Function, reject: Function) => void} arg0 The executor for the promise
   *
   * @overload
   * Wraps a native promise in the wrapper class
   * @param {Promise} arg0 A native Promise
   */
  construct(arg0) {
    super();
    if (typeof arg0 === "function") {
      this.__promise = new Promise(arg0);
    } else if (typeof arg0 === "object" && arg0.constructor === Promise) {
      this.__promise = arg0;
    }
  },

  members: {
    /**
     * @type {Object} The context that this promise is bound to
     */
    __context: null,

    /**
     * Creates a new promise just like this one, but with a context set
     * @see
     * @param {Object} context
     * @returns
     */
    bind(context) {
      let promise = new qx.promise.NativeWrapper(this.__promise);
      return promise.__setContext(context);
    },

    /**
     * Same as for Native Promise
     * @returns {qx.promise.NativeWrapper}
     */
    then(onResolved, onRejected) {
      onResolved = onResolved.bind(this.__context);
      if (onRejected) {
        onRejected = onRejected.bind(this.__context);
      }
      return qx.promise.NativeWrapper.__wrap(
        this.__promise.then(onResolved, onRejected)
      ).__setContext(this.__context);
    },

    /**
     * Same as for Native Promise
     * @returns {qx.promise.NativeWrapper}
     */
    catch(handler) {
      handler = handler.bind(this.__context);
      return qx.promise.NativeWrapper.__wrap(
        this.__promise.catch(handler)
      ).__setContext(this.__context);
    },

    /**
     * Same as for Native Promise
     * @returns {qx.promise.NativeWrapper}
     */
    spread(fulfilledHandler) {
      return this.then(values => fulfilledHandler(...values));
    },

    /**
     * Same as for Native Promise
     * @returns {qx.promise.NativeWrapper}
     */
    finally(handler) {
      handler = handler.bind(this.__context);
      return qx.promise.NativeWrapper.__wrap(
        this.__promise.finally(handler)
      ).__setContext(this.__context);
    },

    /**
     * Due to the high complexity of implementing this feature, it is not supported in qx.promise.NativeWrapper
     */
    cancel() {
      throw new Error(
        "qx.promise.NativeWrapper does not support canceling promises"
      );
    },

    /**
     * Note: Only call when this promise will resolve to an array
     * Same as Promise.all, but passed with the array that this promise resolves to
     * @returns {qx.promise.NativeWrapper}
     */
    all(...args) {
      return qx.promise.NativeWrapper.all(this, ...args);
    },

    /**
     * Note: Only call when this promise will resolve to an array
     * Same as Promise.race, but passed with the array that this promise resolves to
     * @returns {qx.promise.NativeWrapper}
     */
    race() {
      return qx.promise.NativeWrapper.race(this);
    },

    /**
     * Note: Only call when this promise will resolve to an array
     * Same as Promise.any, but passed with the array that this promise resolves to
     * @returns {qx.promise.NativeWrapper}
     */
    any() {
      return qx.promise.NativeWrapper.any(this);
    },

    /**
     * Same as {@link qx.promise.NativeWrapper.some} except that it iterates over the value of this promise, when
     * it is fulfilled; return a promise that is fulfilled as soon as count promises are fulfilled
     * in the array. The fulfillment value is an array with count values in the order they were fulfilled.
     *
     * @param count {Integer}
     * @return {qx.promise.NativeWrapper}
     */
    some(count) {
      return qx.promise.NativeWrapper.some(this, count);
    },

    /**
     * Same as {@link qx.promise.NativeWrapper.each} except that it iterates over the value of this promise, when
     * it is fulfilled; iterates over the values with the given <code>iterator</code> function with the signature
     * <code>(value, index, length)</code> where <code>value</code> is the resolved value. Iteration happens
     * serially. If any promise is rejected the returned promise is rejected as well.
     *
     * Resolves to the original array unmodified, this method is meant to be used for side effects. If the iterator
     * function returns a promise or a thenable, then the result of the promise is awaited, before continuing with
     * next iteration.
     *
     * @param iterator {Function} the callback, with <code>(value, index, length)</code>
     * @return {qx.promise.NativeWrapper}
     */
    each(iterator) {
      return qx.promise.NativeWrapper.each(this, iterator);
    },

    /**
     * Same as {@link qx.promise.NativeWrapper.filter} except that it iterates over the value of this promise, when it is fulfilled;
     * iterates over all the values into an array and filter the array to another using the given filterer function.
     *
     * @param iterable {Iterable} An iterable object, such as an Array
     * @param iterator {Function} the callback, with <code>(value, index, length)</code>
     * @param options {Object?} options; can be:
     *  <code>concurrency</code> max nuber of simultaneous filters, default is <code>Infinity</code>
     * @return {qx.promise.NativeWrapper}
     */
    filter(iterator, options) {
      return qx.promise.NativeWrapper.filter(this, iterator, options);
    },

    /**
     * Same as {@link qx.promise.NativeWrapper.map} except that it iterates over the value of this promise, when it is fulfilled;
     * iterates over all the values into an array and map the array to another using the given mapper function.
     *
     * Promises returned by the mapper function are awaited for and the returned promise doesn't fulfill
     * until all mapped promises have fulfilled as well. If any promise in the array is rejected, or
     * any promise returned by the mapper function is rejected, the returned promise is rejected as well.
     *
     * The mapper function for a given item is called as soon as possible, that is, when the promise
     * for that item's index in the input array is fulfilled. This doesn't mean that the result array
     * has items in random order, it means that .map can be used for concurrency coordination unlike
     * .all.
     *
     * @param iterator {Function} the callback, with <code>(value, index, length)</code>
     * @param options {Object?} * A native object with one key: <code>concurrency</code>: max number of simultaneous maps, default is <code>Infinity</code>
     * @return {qx.promise.NativeWrapper}
     */
    map(iterator, options) {
      return qx.promise.NativeWrapper.map(this, iterator, options);
    },

    /**
     * Same as {@link qx.promise.NativeWrapper.mapSeries} except that it iterates over the value of this promise, when
     * it is fulfilled; iterates over all the values into an array and iterate over the array serially,
     * in-order.
     *
     * Returns a promise for an array that contains the values returned by the iterator function in their
     * respective positions. The iterator won't be called for an item until its previous item, and the
     * promise returned by the iterator for that item are fulfilled. This results in a mapSeries kind of
     * utility but it can also be used simply as a side effect iterator similar to Array#forEach.
     *
     * If any promise in the input array is rejected or any promise returned by the iterator function is
     * rejected, the result will be rejected as well.
     *
     * @param iterator {Function} the callback, with <code>(value, index, length)</code>
     * @return {qx.promise.NativeWrapper}
     */
    mapSeries(iterator, options) {
      return qx.promise.NativeWrapper.mapSeries(this, iterator, options);
    },

    /**
     * Same as {@link qx.promise.NativeWrapper.reduce} except that it iterates over the value of this promise, when
     * it is fulfilled; iterates over all the values in the <code>Iterable</code> into an array and
     * reduce the array to a value using the given reducer function.
     *
     * If the reducer function returns a promise, then the result of the promise is awaited, before
     * continuing with next iteration. If any promise in the array is rejected or a promise returned
     * by the reducer function is rejected, the result is rejected as well.
     *
     * If initialValue is undefined (or a promise that resolves to undefined) and the iterable contains
     * only 1 item, the callback will not be called and the iterable's single item is returned. If the
     * iterable is empty, the callback will not be called and initialValue is returned (which may be
     * undefined).
     *
     * qx.promise.NativeWrapper.reduce will start calling the reducer as soon as possible, this is why you might want to
     * use it over qx.promise.NativeWrapper.all (which awaits for the entire array before you can call Array#reduce on it).
     *
     * @param reducer {Function} the callback, with <code>(value, index, length)</code>
     * @param initialValue {Object?} optional initial value
     * @return {qx.promise.NativeWrapper}
     */
    reduce(reducer, initialValue) {
      return qx.promise.NativeWrapper.reduce(this, reducer, initialValue);
    },

    /**
     *
     * @param {Object} context
     * @returns {qx.promise.NativeWrapper} this object to support chaining
     */
    __setContext(context) {
      this.__context = context;
      return this;
    }
  },

  statics: {
    /**
     * Wraps a promise in a qx.promise.NativeWrapper
     * @param {Promise} promise
     * @returns
     */
    __wrap(promise) {
      if (qx.core.Environment.get("qx.debug")) {
        if (promise.constructor !== Promise) {
          throw new Error("Only native promises can be wrapped!");
        }
      }

      return new qx.promise.NativeWrapper(promise);
    },
    /**
     * Returns a Promise object that is resolved with the given value. If the value is a thenable (i.e.
     * has a then method), the returned promise will "follow" that thenable, adopting its eventual
     * state; otherwise the returned promise will be fulfilled with the value. Generally, if you
     * don't know if a value is a promise or not, Promise.resolve(value) it instead and work with
     * the return value as a promise.
     *
     * @param value {Object}
     * @return {qx.promise.NativeWrapper}
     */
    resolve(value) {
      return qx.promise.NativeWrapper.__wrap(Promise.resolve(value));
    },

    /**
     * Returns a Promise object that is rejected with the given reason.
     * @param reason {Object?} Reason why this Promise rejected. A warning is generated if not instanceof Error. If undefined, a default Error is used.
     * @return {qx.promise.NativeWrapper}
     */
    reject(reason) {
      return qx.promise.NativeWrapper.__wrap(Promise.reject(reason));
    },

    /**
     * Returns a promise that resolves when all of the promises in the object properties have resolved,
     * or rejects with the reason of the first passed promise that rejects.  The result of each property
     * is placed back in the object, replacing the promise.  Note that non-promise values are untouched.
     *
     * @param value {var} An object
     * @return {qx.promise.NativeWrapper}
     */
    allOf(value) {
      function action(value) {
        var arr = [];
        var names = [];
        for (var name in value) {
          if (value.hasOwnProperty(name) && qx.Promise.isPromise(value[name])) {
            arr.push(value[name]);
            names.push(name);
          }
        }
        return qx.promise.NativeWrapper.all(arr).then(function (arr) {
          arr.forEach(function (item, index) {
            value[names[index]] = item;
          });
          return value;
        });
      }
      return qx.Promise.isPromise(value) ? value.then(action) : action(value);
    },

    /**
     * Returns a promise that resolves when all of the promises in the iterable argument have resolved,
     * or rejects with the reason of the first passed promise that rejects.  Note that non-promise values
     * are untouched.
     *
     * @param iterable {Iterable} An iterable object, such as an Array
     * @return {qx.promise.NativeWrapper}
     */
    all(iterable) {
      return qx.promise.NativeWrapper.resolve(iterable).then(iterable =>
        qx.promise.NativeWrapper.__wrap(Promise.all(iterable))
      );
    },

    /**
     * Returns a promise that resolves or rejects as soon as one of the promises in the iterable resolves
     * or rejects, with the value or reason from that promise.
     * @param iterable {Iterable} An iterable object, such as an Array
     * @return {qx.promise.NativeWrapper}
     */
    race(iterable) {
      return qx.promise.NativeWrapper.resolve(iterable).then(
        iterableResolved =>
          new qx.promise.NativeWrapper(Promise.race(iterableResolved))
      );
    },

    /* *********************************************************************************
     *
     * Extension API methods
     *
     */

    /**
     * Like Promise.some, with 1 as count. However, if the promise fulfills, the fulfillment value is not an
     * array of 1 but the value directly.
     *
     * @param iterable {Iterable} An iterable object, such as an Array
     * @return {qx.promise.NativeWrapper}
     */
    any(iterable) {
      return qx.promise.NativeWrapper.resolve(iterable).then(
        iterableResolved =>
          new qx.promise.NativeWrapper(Promise.any(iterableResolved))
      );
    },

    /**
     * Given an Iterable (arrays are Iterable), or a promise of an Iterable, which produces promises (or a mix
     * of promises and values), iterate over all the values in the Iterable into an array and return a promise
     * that is fulfilled as soon as count promises are fulfilled in the array. The fulfillment value is an
     * array with count values in the order they were fulfilled.
     *
     * @param iterable {Iterable} An iterable object, such as an Array
     * @param count {Integer}
     * @return {qx.promise.NativeWrapper}
     */
    some(iterable, count) {
      return new qx.promise.NativeWrapper((resolve, reject) => {
        qx.promise.NativeWrapper.resolve(iterable).then(iterable => {
          let resolved = [];
          let rejected = [];
          let minToReject = iterable.length - count + 1;

          const onResolved = value => {
            if (resolved.length >= count) {
              return;
            }
            resolved.push(value);
            if (resolved.length == count) {
              resolve(resolved);
            }
          };

          const onRejected = reason => {
            rejected.push(reason);
            if (--minToReject == 0) {
              reject(new AggregateError(rejected));
            }
          };
          iterable.forEach((elem, index) => {
            if (qx.Promise.isPromise(elem)) {
              elem.then(onResolved, onRejected);
            } else {
              onResolved(elem);
            }
          });
        });
      });
    },

    /**
     * Iterate over an array, or a promise of an array, which contains promises (or a mix of promises and values)
     * with the given <code>iterator</code> function with the signature <code>(value, index, length)</code> where
     * <code>value</code> is the resolved value of a respective promise in the input array. Iteration happens
     * serially. If any promise in the input array is rejected the returned promise is rejected as well.
     *
     * Resolves to the original array unmodified, this method is meant to be used for side effects. If the iterator
     * function returns a promise or a thenable, then the result of the promise is awaited, before continuing with
     * next iteration.
     *
     * @param iterable {Iterable} An iterable object, such as an Array
     * @param iterator {Function} the callback, with <code>(value, index, length)</code>
     * @return {qx.promise.NativeWrapper}
     */
    each(iterable, iterator) {
      let f = async () => {
        let iterableValue = await iterable;
        let index = 0;

        for (let item of iterableValue) {
          let itemResolved = await item;
          await iterator(itemResolved, index++, iterable.length);
        }
      };
      return new qx.promise.NativeWrapper(f());
    },

    /**
     * Given an Iterable(arrays are Iterable), or a promise of an Iterable, which produces promises (or a mix of
     * promises and values), iterate over all the values in the Iterable into an array and filter the array to
     * another using the given filterer function.
     *
     * It is essentially an efficient shortcut for doing a .map and then Array#filter:
     * <pre>
     *   qx.promise.NativeWrapper.map(valuesToBeFiltered, function(value, index, length) {
     *       return Promise.all([filterer(value, index, length), value]);
     *   }).then(function(values) {
     *       return values.filter(function(stuff) {
     *           return stuff[0] == true
     *       }).map(function(stuff) {
     *           return stuff[1];
     *       });
     *   });
     * </pre>
     *
     * @param iterable {Iterable} An iterable object, such as an Array
     * @param iterator {Function} the callback, with <code>(value, index, length)</code>
     * @param options {Object?} Either:
     *   A native object with one key: <code>concurrency</code>: max number of simultaneous filters, default is <code>Infinity</code>
     * Or: any other object, in which case this will be the context for the iterator
     * @return {qx.promise.NativeWrapper}
     */
    filter(iterable, iterator, options) {
      let limiter = new qx.util.ConcurrencyLimiter(options?.concurrency);

      const doit = async () => {
        let iterableResolved = await iterable;
        let resultsPromises = iterableResolved.map((item, index) =>
          limiter.add(async () => {
            let itemResolved = await item;
            let keep = await iterator(
              itemResolved,
              index,
              iterableResolved.length
            );
            return { keep, val: itemResolved };
          })
        );

        let values = await qx.promise.NativeWrapper.all(resultsPromises);
        return values.filter(({ keep }) => keep).map(({ val }) => val);
      };

      return new qx.promise.NativeWrapper(doit());
    },

    /**
     * Given an <code>Iterable</code> (arrays are <code>Iterable</code>), or a promise of an
     * <code>Iterable</code>, which produces promises (or a mix of promises and values), iterate over
     * all the values in the <code>Iterable</code> into an array and map the array to another using
     * the given mapper function.
     *
     * Promises returned by the mapper function are awaited for and the returned promise doesn't fulfill
     * until all mapped promises have fulfilled as well. If any promise in the array is rejected, or
     * any promise returned by the mapper function is rejected, the returned promise is rejected as well.
     *
     * The mapper function for a given item is called as soon as possible, that is, when the promise
     * for that item's index in the input array is fulfilled. This doesn't mean that the result array
     * has items in random order, it means that .map can be used for concurrency coordination unlike
     * .all.
     *
     * A common use of Promise.map is to replace the .push+Promise.all boilerplate:
     *
     * <pre>
     *   var promises = [];
     *   for (var i = 0; i < fileNames.length; ++i) {
     *       promises.push(fs.readFileAsync(fileNames[i]));
     *   }
     *   qx.promise.NativeWrapper.all(promises).then(function() {
     *       console.log("done");
     *   });
     *
     *   // Using Promise.map:
     *   qx.promise.NativeWrapper.map(fileNames, function(fileName) {
     *       // Promise.map awaits for returned promises as well.
     *       return fs.readFileAsync(fileName);
     *   }).then(function() {
     *       console.log("done");
     *   });
     * </pre>
     *
     * @param iterable {Iterable} An iterable object, such as an Array
     * @param iterator {Function} the callback, with <code>(value, index, length)</code>
     * @param options {Object?} * A native object with one key: <code>concurrency</code>: max number of simultaneous maps, default is <code>Infinity</code>
     * @return {qx.promise.NativeWrapper}
     */
    map(iterable, iterator, options) {
      return qx.promise.NativeWrapper.resolve(iterable).then(iterable => {
        let limiter = new qx.util.ConcurrencyLimiter(options?.concurrency);

        let resultsPromises = iterable.map((item, index) =>
          limiter.add(async () => {
            let itemResolved = await item;
            let result = await iterator(itemResolved, index, iterable.length);
            return result;
          })
        );

        return qx.promise.NativeWrapper.all(resultsPromises);
      });
    },

    /**
     * Given an <code>Iterable</code>(arrays are <code>Iterable</code>), or a promise of an
     * <code>Iterable</code>, which produces promises (or a mix of promises and values), iterate over
     * all the values in the <code>Iterable</code> into an array and iterate over the array serially,
     * in-order.
     *
     * Returns a promise for an array that contains the values returned by the iterator function in their
     * respective positions. The iterator won't be called for an item until its previous item, and the
     * promise returned by the iterator for that item are fulfilled. This results in a mapSeries kind of
     * utility but it can also be used simply as a side effect iterator similar to Array#forEach.
     *
     * If any promise in the input array is rejected or any promise returned by the iterator function is
     * rejected, the result will be rejected as well.
     *
     * Example where .mapSeries(the instance method) is used for iterating with side effects:
     *
     * <pre>
     * // Source: http://jakearchibald.com/2014/es7-async-functions/
     * function loadStory() {
     *   return getJSON('story.json')
     *     .then(function(story) {
     *       addHtmlToPage(story.heading);
     *       return story.chapterURLs.map(getJSON);
     *     })
     *     .mapSeries(function(chapter) { addHtmlToPage(chapter.html); })
     *     .then(function() { addTextToPage("All done"); })
     *     .catch(function(err) { addTextToPage("Argh, broken: " + err.message); })
     *     .then(function() { document.querySelector('.spinner').style.display = 'none'; });
     * }
     * </pre>
     *
     * @param iterable {Iterable} An iterable object, such as an Array
     * @param iterator {Function} the callback, with <code>(value, index, length)</code>
     * @return {qx.promise.NativeWrapper}
     */
    mapSeries(iterable, iterator) {
      return new qx.promise.NativeWrapper(async (resolve, reject) => {
        let failed = false;
        const fail = reason => {
          if (!failed) {
            failed = true;
            reject(reason);
          }
        };

        //We must handle the rejections of promises ASAP
        //to prevent unhandled promise rejections
        qx.promise.NativeWrapper.all(iterable).catch(fail);

        let result = [];

        iterable = await iterable;

        try {
          let index = 0;
          for (let promise of iterable) {
            let value = await promise;
            let mapped = await iterator(value, index++, iterable.length);
            result.push(mapped);
          }
        } catch (ex) {
          fail(ex);
        }

        resolve(result);
      });
    },

    /**
     * Given an <code>Iterable</code> (arrays are <code>Iterable</code>), or a promise of an
     * <code>Iterable</code>, which produces promises (or a mix of promises and values), iterate
     * over all the values in the <code>Iterable</code> into an array and reduce the array to a
     * value using the given reducer function.
     *
     * If the reducer function returns a promise, then the result of the promise is awaited, before
     * continuing with next iteration. If any promise in the array is rejected or a promise returned
     * by the reducer function is rejected, the result is rejected as well.
     *
     * Read given files sequentially while summing their contents as an integer. Each file contains
     * just the text 10.
     *
     * <pre>
     *   qx.promise.NativeWrapper.reduce(["file1.txt", "file2.txt", "file3.txt"], function(total, fileName) {
     *       return fs.readFileAsync(fileName, "utf8").then(function(contents) {
     *           return total + parseInt(contents, 10);
     *       });
     *   }, 0).then(function(total) {
     *       //Total is 30
     *   });
     * </pre>
     *
     * If initialValue is undefined (or a promise that resolves to undefined) and the iterable contains
     * only 1 item, the callback will not be called and the iterable's single item is returned. If the
     * iterable is empty, the callback will not be called and initialValue is returned (which may be
     * undefined).
     *
     * Promise.reduce will start calling the reducer as soon as possible, this is why you might want to
     * use it over Promise.all (which awaits for the entire array before you can call Array#reduce on it).
     *
     * @param iterable {Iterable} An iterable object, such as an Array
     * @param reducer {Function} the callback, with <code>(value, index, length)</code>
     * @param initialValue {Object?} optional initial value
     * @return {qx.promise.NativeWrapper}
     */
    reduce(iterable, reducer, initialValue) {
      return new qx.promise.NativeWrapper(async (resolve, reject) => {
        let failed = false;
        function fail(reason) {
          if (!failed) {
            failed = true;
            reject(reason);
          }
        }

        try {
          let iterableResolved = await iterable;

          //We must handle the rejections of promises ASAP
          //to prevent unhandled promise rejections
          iterableResolved.forEach((item, index) => {
            if (qx.Promise.isPromise(item)) {
              item.catch(fail);
            }
          });

          let accum = initialValue;
          let index = 0;
          for (let promise of iterableResolved) {
            let data = await promise;
            accum = await reducer(accum, data, index, iterableResolved.length);
            index++;
          }
          resolve(accum);
        } catch (ex) {
          fail(ex);
        }
      });
    },

    /**
     * Returns a new function that wraps the given function fn. The new function will always return a promise that is
     * fulfilled with the original functions return values or rejected with thrown exceptions from the original function.
     * @param cb {Function}
     * @return {Function}
     */
    method(cb) {
      return (...args) =>
        new qx.promise.NativeWrapper(resolve =>
          resolve(cb.call(this.__context, ...args))
        );
    },

    /**
     * Like .all but for object properties or Maps* entries instead of iterated values. Returns a promise that
     * is fulfilled when all the properties of the object or the Map's' values** are fulfilled. The promise's
     * fulfillment value is an object or a Map with fulfillment values at respective keys to the original object
     * or a Map. If any promise in the object or Map rejects, the returned promise is rejected with the rejection
     * reason.
     *
     * If object is a trusted Promise, then it will be treated as a promise for object rather than for its
     * properties. All other objects (except Maps) are treated for their properties as is returned by
     * Object.keys - the object's own enumerable properties.
     *
     * @param input {Object} An Object
     * @return {qx.promise.NativeWrapper}
     */
    props(input) {
      return qx.promise.NativeWrapper.resolve(input).then(input => {
        let entries = Object.entries(input);
        let promises = entries.map(
          entry =>
            new qx.promise.NativeWrapper(async resolve => {
              const value = await entry[1];
              resolve([entry[0], value]);
            })
        );
        return qx.promise.NativeWrapper.all(promises).then(values => {
          let result = {};
          values.forEach(entry => {
            result[entry[0]] = entry[1];
          });
          return result;
        });
      });
    }
  }
});
