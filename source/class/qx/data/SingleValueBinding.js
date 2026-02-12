/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2022-2023 Zenesis Limited, https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (https://github.com/johnspackman, john.spackman@zenesis.com)
     * Patryk Malinowski (https://github.com/patryk-m-malinowski, pmalinowski116@gmail.com)

************************************************************************ */

/**
 * This class implements bindings as a first class object.
 *
 * The Binding has a source, a value, and optional target; the source (and
 * sourcePath) is read and copied into value; the value is copied into the target
 * if there is one.
 *
 * If the sourcePath is null, then the value will be the source object; if the
 * target or the targetPath is null, then the `value` will still update but will
 * not be copied anywhere
 *
 * Arrays are supported by including `[]` in paths, eg `children[2]`, although this
 * only works with `sourcePath` and not in `targetPath`.  Arrays can be native or
 * `qx.data.Array`, but changes to native arrays will not be detected because they
 * dont fire events
 *
 * @typedef {[qx.data.SingleValueBinding, qx.core.Object, string, qx.core.Object, string]} BindingRecord Array representation of the binding,
 * containing the binding, source object, source path, target object and target path respectively.
 */
qx.Class.define("qx.data.SingleValueBinding", {
  extend: qx.core.Object,
  implement: [qx.data.binding.IInputReceiver],

  /**
   * The class is responsible for binding a source objects property to
   * a target objects property. Both properties have to have the usual qooxdoo
   * getter and setter. The source property also needs to fire change-events
   * on every change of its value.
   * Please keep in mind, that this binding is unidirectional. If you need
   * a binding in both directions, you have to use two of this bindings.
   *
   * It's also possible to bind some kind of a hierarchy as a source. This
   * means that you can separate the source properties with a dot and bind
   * by that the object referenced to this property chain.
   * Example with an object 'a' which has object 'b' stored in its 'child'
   * property. Object b has a string property named abc:
   * <pre><code>
   * qx.data.SingleValueBinding.bind(a, "child.abc", textfield, "value");
   * </code></pre>
   * In that case, if the property abc of b changes, the textfield will
   * automatically contain the new value. Also if the child of a changes, the
   * new value (abc of the new child) will be in the textfield.
   *
   * There is also a possibility of binding an array. Therefore the array
   * {@link qx.data.IListData} is needed because this array has change events
   * which the native does not. Imagine a qooxdoo object a which has a
   * children property containing an array holding more of its own kind.
   * Every object has a name property as a string.
   * <pre>
   * var svb = qx.data.SingleValueBinding;
   * // bind the first child's name of 'a' to a textfield
   * svb.bind(a, "children[0].name", textfield, "value");
   * // bind the last child's name of 'a' to a textfield
   * svb.bind(a, "children[last].name", textfield2, "value");
   * // also deeper bindings are possible
   * svb.bind(a, "children[0].children[0].name", textfield3, "value");
   * </pre>
   *
   * As you can see in this example, the abc property of a's b will be bound
   * to the textfield. If now the value of b changed or even the a will get a
   * new b, the binding still shows the right value.
   *
   * @param {qx.core.Object?} sourceObject The source of the binding.
   * @param {String} sourcePropertyChain The property chain which represents
   *   the source property.
   * @param {qx.core.Object?} targetObject The object which the source should
   *   be bound to.
   * @param {String} targetPropertyChain The property chain to the target
   *   object.
   * @param {BindingOptions} options A map containing the options.
   *
   * @typedef BindingOptions
   * @property {converter} converter Data converter function. If no conversion has been done, the given value should be returned.
   * e.g. a number to boolean converter
   * <code>function(data, model, source, target) {return data > 100;}</code>
   * @property {onUpdate} onUpdate This callback will be called if the binding was updated successfully.
   * @property {() => void} onSetFail A callback function can be given here. This function will
   *       be called if the set of the value fails.
   * @property {string} ignoreConverter A string which will be matched using the current
   *       property chain. If it matches, the converter will not be called.
   * 
   *
   * @callback converter
   * @param {*} data The data to convert
   * @param {*} model The corresponding model object, which is only set in case of the use of an controller.
   * @param {qx.core.Object} source The source object for the binding
   * @param {qx.core.Object} target The target object
   * @returns {*} The converted data
   * 
   * @callback onUpdate
   * @param {qx.core.Object} source The source object for the binding
   * @param {qx.core.Object} target The target object
   * @param {*} data The data
       
  *
  * @returns {qx.data.SingleValueBinding} Returns the internal id for that binding. This can be used
  *   for referencing the binding or e.g. for removing. This is not an atomic
  *   id so you can't you use it as a hash-map index.
  *
  * @throws {qx.core.AssertionError} If the event is no data event or
  *   there is no property definition for object and property (source and
  *   target).
  */
  construct(sourcePath, targetPath, source, target, options) {
    super();
    if (!(sourcePath || targetPath)) {
      throw new Error("SourcePath and targetPath must be specified");
    }
    this.__options = options ?? {};
    let tracker = {};

    const Utils = qx.event.Utils;
    this.setSourcePath(sourcePath);
    this.setTargetPath(targetPath);
    Utils.then(tracker, () => source && this.setSource(source));
    Utils.then(tracker, () => target && this.setTarget(target));
  },

  destruct() {
    if (this.__sourceSegments) {
      this.__sourceSegments.forEach(segment => segment.dispose());
      this.__sourceSegments = null;
    }
    if (this.__targetSegments) {
      this.__targetSegments.forEach(segment => segment.dispose());
      this.__targetSegments = null;
    }
    this.setSource(null);
    this.setTarget(null);
  },

  properties: {
    /** The path into the `source` object */
    sourcePath: {
      init: null,
      nullable: true,
      check: "String",
      event: "changeSourcePath",
      apply: "_applySourcePath"
    },

    /** The path into the `target` object */
    targetPath: {
      init: null,
      nullable: true,
      check: "String",
      event: "changeTargetPath",
      apply: "_applyTargetPath"
    }
  },

  members: {
    /**
     * @type {*}
     */
    __value: null,
    /**
     * @type {qx.core.Object}
     */
    __source: null,

    /**
     * @type {BindingRecord?}
     */
    __record: null,

    /**
     * @type {qx.core.Object}
     */
    __target: null,

    /** @type {Promise} initialisation promise */
    __initPromise: null,

    /** @type {qx.data.binding.AbstractSegment[]?} list of segments of the source path */
    __sourceSegments: null,

    /** @type {qx.data.binding.AbstractSegment[]?} list of segments of the target path */
    __targetSegments: null,

    /**
     * @type {BindingOptions}
     */
    __options: null,

    /**
     * Promises/A+ thenable compliance, this means that you can await the binding for initialisation
     * https://promisesaplus.com/
     * @returns {Promise} the promise
     */
    then(onFulfilled, onRejected) {
      return Promise.resolve(this.__initPromise).then(onFulfilled, onRejected);
    },

    /**
     *
     * @returns {BindingRecord} The representation of this binding as record.
     */
    asRecord() {
      if (!this.__record) {
        this.__record = [this, this.getSource(), this.getSourcePath(), this.getTarget(), this.getTargetPath()];
      }
      return this.__record;
    },

    /**
     * @override
     */
    toString() {
      return `${super.toString()}: ${this.getSource()}.${this.getSourcePath()} -> ${this.getTarget()}.${this.getTargetPath()}`;
    },

    /**
     *
     * @returns {Promise} A promise which resolves when the initial value has been copied over from source to target
     */
    getInitPromise() {
      return this.__initPromise;
    },

    /**
     * Apply for `sourcePath`
     */
    _applySourcePath(value, oldValue) {
      if (oldValue) {
        throw new Error("Cannot change sourcePath after binding has been created");
      }
      this.__record = null; // invalidate record representation cache
      this.__sourceSegments = qx.data.SingleValueBinding.__parseSegments(this, value);
      let lastSegment = this.__sourceSegments.at(-1);
      lastSegment.setOutputReceiver(this);
    },

    /**
     * Sets the source object of this binding.
     * If a target is set, the target will be updated with source's value.
     *
     * @param {qx.core.Object?} value The source object to get the `value` by looking up `sourcePath`
     * @returns {Promise?} A promise if any stage of the process was asynchronous, i.e. we had to get a property asynchronously along the source/target path,
     * or setting the target was asynchronous.
     * If everything was synchronous, then this will return null.
     */
    setSource(value) {
      const SingleValueBinding = qx.data.SingleValueBinding;
      if (this.__source === value) {
        return;
      }

      this.__record = null; // invalidate record representation cache
      let oldValue = this.__source;
      this.__source = value;
      this.__initPromise = null; // reset the init promise, as the source has changed

      if (oldValue) {
        //Delete old source's bindings if there was one
        delete SingleValueBinding.__bindingsBySource[oldValue.toHashCode()][this.toHashCode()];
        if (qx.lang.Object.isEmpty(SingleValueBinding.__bindingsBySource[oldValue.toHashCode()])) {
          delete SingleValueBinding.__bindingsBySource[oldValue.toHashCode()];
        }
      }

      if (value) {
        //Store the binding
        SingleValueBinding.__bindingsBySource[value.toHashCode()] ??= {};
        SingleValueBinding.__bindingsBySource[value.toHashCode()][this.toHashCode()] = this;

        //Set the input on the first segment of the source path
        let promise = this.__sourceSegments[0].setInput(value);
        const cb = () => {
          if (qx.core.Environment.get("qx.debug")) {
            this.assertNotNull(
              this.__sourceSegments[0].getEventName(),
              `Binding property ${this.__sourceSegments[0].toString()} of object ${value.classname} not possible. No event available.`
            );
          }
        };

        let out;

        if (qx.Promise.isPromise(promise)) {
          out = promise.then(cb);
        } else {
          out = cb();
        }
        this.__initPromise = Promise.resolve(out);
        return out;
      }
    },

    /**
     * @returns {qx.core.Object} the source object
     */
    getSource() {
      return this.__source;
    },

    /**
     * Apply for `targetPath`
     */
    _applyTargetPath(value, oldValue) {
      if (oldValue) {
        throw new Error("Cannot change targetPath after binding has been created");
      }
      this.__record = null; // invalidate record representation cache
      this.__targetSegments = qx.data.SingleValueBinding.__parseSegments(this, value);
      this.__targetSegments.at(-1).addListener("changeInput", this.__updateTarget, this);
    },

    /**
     * Sets the target object of this binding.
     * If a source is set, the target will be updated with source's value.
     *
     * @param {qx.core.Object?} value The source object to get the `value` by looking up `sourcePath`
     * @returns {Promise?} A promise if any stage of the process was asynchronous, i.e. we had to get a property asynchronously along the source/target path,
     * or setting the target was asynchronous.
     * If everything was synchronous, then this will return null.
     */
    setTarget(value) {
      if (this.__target === value) {
        return;
      }

      this.__record = null; // invalidate record representation cache
      this.__initPromise = null; // reset the init promise, as the target has changed
      let oldValue = this.__target;
      this.__target = value;
      const SingleValueBinding = qx.data.SingleValueBinding;

      if (oldValue) {
        delete SingleValueBinding.__bindingsByTarget[oldValue.toHashCode()][this.toHashCode()];
        if (qx.lang.Object.isEmpty(SingleValueBinding.__bindingsByTarget[oldValue.toHashCode()])) {
          delete SingleValueBinding.__bindingsByTarget[oldValue.toHashCode()];
        }
      }

      if (value) {
        const SingleValueBinding = qx.data.SingleValueBinding;
        SingleValueBinding.__bindingsByTarget[value.toHashCode()] ??= {};
        SingleValueBinding.__bindingsByTarget[value.toHashCode()][this.toHashCode()] = this;

        let out = this.__targetSegments[0].setInput(value);
        this.__initPromise = Promise.resolve(out);
        return out;
      }
    },

    /**
     *
     * @returns {qx.core.Object} the target object
     */
    getTarget() {
      return this.__target;
    },

    /**
     * This method should not be called directly.
     * It is only there to comply with interface `qx.data.binding.IInputReceiver`.
     * @override interface qx.data.binding.IInputReceiver
     *
     * @param {*} input
     */
    setInput(input) {
      return this.__setValue(input);
    },

    /**
     *
     * @param {*} value The final value obtained from the sourcePath
     * @returns {Promise?} A promise if setting the target is asynchronous, otherwise null
     */
    __setValue(value) {
      if (this.__value === value) {
        return null; // no change
      }
      this.__value = value;
      return this.__updateTarget();
    },

    /**
     *
     * @returns {*} the value that was set by the sourcePath
     */
    getValue() {
      return this.__value;
    },

    /**
     * Updates the target with the current value
     */
    __updateTarget() {
      if (this.__targetSegments) {
        //We need to make sure the target segments are up to date
        //because the listeners may trigger after this point.
        //This is important in bidirectional bindings.
        for (let segment of this.__targetSegments) {
          if (segment.getOutputReceiver()) {
            segment.updateOutput();
          }
        }
      }

      let lastSegment = this.__targetSegments.at(-1);

      if (this.getTarget() && this.getSource()) {
        let value = this.getValue();

        let ignoreConverter = false;
        if (this.__options.ignoreConverter) {
          var match = this.getSourcePath().match(new RegExp("^" + this.__options.ignoreConverter));
          ignoreConverter = match ? match.length > 0 : false;
        }

        if (this.__options.converter && (value !== undefined || !ignoreConverter)) {
          let model = typeof this.getTarget().getModel == "function" ? this.getTarget().getModel() : null;
          value = this.__options.converter(value, model, this.getSource(), this.getTarget());
        }

        const cb = ex => {
          if (ex) {
            this.__options.onSetFail?.();
          } else {
            this.__options.onUpdate?.(this.getSource(), this.getTarget(), value);
          }
          return null;
        };

        let ret;
        try {
          ret = lastSegment.setTargetValue(value);
        } catch (ex) {
          return cb(ex);
        }

        if (qx.Promise.isPromise(ret)) {
          return ret.then(cb, cb);
        } else {
          cb(null);
        }
      }
    }
  },

  statics: {
    /** @type {Object<String,Object<String,Binding>>} map of maps, outer map is indexed by object hash, inner is indexed by binding hash */
    __bindingsBySource: {},

    /** @type {Object<String,Object<String,Binding>>} map of maps, outer map is indexed by object hash, inner is indexed by binding hash */
    __bindingsByTarget: {},

    /**
     * @see {qx.data.SingleValueBinding#construct}
     */
    bind(sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options) {
      // check for the arguments
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertObject(sourceObject, "sourceObject");
        qx.core.Assert.assertString(sourcePropertyChain, "sourcePropertyChain");
        qx.core.Assert.assertObject(targetObject, "targetObject");
        qx.core.Assert.assertString(targetPropertyChain, "targetPropertyChain");
      }

      let binding = new qx.data.SingleValueBinding(sourcePropertyChain, targetPropertyChain, sourceObject, targetObject, options);

      return binding;
    },

    /**
     * Removes the binding with the given id from the given sourceObject. The
     * id has to be the id returned by any of the bind functions.
     *
     * @param sourceObject {qx.core.Object} The source object of the binding.
     * @param id {var} The id of the binding.
     * @throws {Error} If the binding could not be found.
     */
    removeBindingFromObject(sourceObject, binding) {
      binding.dispose();
    },

    /**
     * Removes all bindings for the given object.
     *
     * @param object {qx.core.Object} The object of which the bindings should be
     *   removed.
     * @throws {qx.core.AssertionError} If the object is not in the internal
     *   registry of the bindings.
     * @throws {Error} If one of the bindings listed internally can not be
     *   removed.
     */
    removeAllBindingsForObject(object) {
      qx.core.Assert.assertNotNull(object, "Null is not possible!");
      qx.data.SingleValueBinding.getAllBindingsForObject(object).forEach(binding => binding[0].dispose());
    },

    /**
     * Debug function which shows some valuable information about the given
     * binding in console. For that it uses {@link qx.log.Logger}.
     *
     * @param object {qx.core.Object} the source of the binding.
     * @param id {var} The id of the binding.
     */
    showBindingInLog(object, binding) {
      qx.log.Logger.debug(
        "Binding from '" +
          binding.getSource() +
          "' (" +
          binding.getSourcePath() +
          ") to the object '" +
          binding.getTarget() +
          "' (" +
          binding.getTargetPath() +
          ")."
      );
    },

    /**
     * Helper for updating the target. Gets the current set data from the source
     * and set that on the target.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourcePropertyChain {String} The property chain which represents
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetPropertyChain {String} The property name of the target
     *   object.
     * @param options {Map} The options map perhaps containing the user defined
     *   converter.
     *
     * @internal
     */
    updateTarget(sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options) {
      options ??= {};
      var value = this.resolvePropertyChain(sourceObject, sourcePropertyChain);

      // convert the data before setting
      if (options.converter) {
        let model = typeof targetObject.getModel == "function" ? targetObject.getModel() : null;
        value = options.converter(value, model, sourceObject, targetObject);
      }

      return this.__setTargetValue(targetObject, targetPropertyChain, value);
    },

    /**
     * Sets the given value to the given target after resolving the
     * target property chain.
     *
     * @param targetObject {qx.core.Object} The object where the property chain
     *   starts.
     * @param targetPropertyChain {String} The names of the properties,
     *   separated with a dot.
     * @param value {var} The value to set.
     */
    __setTargetValue(targetObject, targetPropertyChain, value) {
      let segments = qx.data.SingleValueBinding.__parseSegments(null, targetPropertyChain);
      let lastSegment = segments[segments.length - 1];
      segments[0].setInput(targetObject);
      let out = lastSegment.setTargetValue(value);
      segments.forEach(segment => segment.dispose());
      return out;
    },

    /**
     * Splits a property path into segments.
     * @param {string} path
     * @returns {string[]} an array of segments, split by dot and square brackets.
     * For example, splitSegments(`a.b[0].c`) will return `["a", "b", "[0]", "c"]`
     */
    splitSegments(path) {
      let out = [];
      for (let dotSplit of path.split(".")) {
        let bracketSplits = dotSplit.split("[");
        for (let i = 0; i < bracketSplits.length; i++) {
          let bracketSplit = bracketSplits[i];
          if (i > 0) {
            bracketSplit = "[" + bracketSplit;
          }
          out.push(bracketSplit);
        }
      }
      return out.filter(s => s.length > 0);
    },

    /**
     * Finds all bindings for an object, as either a source or target
     *
     * @param {qx.core.Object} object
     * @returns {BindingRecord[]} An array of the bindings represented as records.
     */
    getAllBindingsForObject(object) {
      const SingleValueBinding = qx.data.SingleValueBinding;
      let allBindings = {
        ...(SingleValueBinding.__bindingsBySource[object.toHashCode()] ?? {}),
        ...(SingleValueBinding.__bindingsByTarget[object.toHashCode()] ?? {})
      };
      return Object.values(allBindings).map(binding => binding.asRecord());
    },

    /**
     * Returns a map containing for every bound object an array of data binding
     * information. The key of the map is the hash code of the bound objects.
     * Every binding is represented by an array containing id, sourceObject,
     * sourceEvent, targetObject and targetProperty.
     *
     * @return {Object<string, BindingInfo>} Map containing all bindings.
     *
     * @typedef {[qx.data.SingleValueBinding, qx.core.Object, string, qx.core.Object, string]} BindingInfo
     * Stores the binding ID, source object, source path, target object and target path respectively.
     */
    getAllBindings() {
      let bindings = qx.data.SingleValueBinding.__bindingsBySource;

      let result = {};
      for (let [objectHash, objectBindings] of Object.entries(bindings)) {
        let objectBindingsArray = [];
        for (let [bindingHash, binding] of Object.entries(objectBindings)) {
          objectBindingsArray.push([binding, binding.getSource(), binding.getSourcePath(), binding.getTarget(), binding.getTargetPath()]);
        }
        result[objectHash] = objectBindingsArray;
      }
      return result;
    },

    /**
     * Removes all bindings between given objects.
     *
     * @param object {qx.core.Object} The object of which the bindings should be
     *   removed.
     * @param relatedObject {qx.core.Object} The object of which related
     *   bindings should be removed.
     * @throws {qx.core.AssertionError} If the object is not in the internal
     *   registry of the bindings.
     * @throws {Error} If one of the bindings listed internally can not be
     *   removed.
     */
    removeRelatedBindings(object, relatedObject) {
      const SingleValueBinding = qx.data.SingleValueBinding;

      let bySourceObject = SingleValueBinding.__bindingsBySource[object.toHashCode()];

      if (bySourceObject) {
        Object.values(bySourceObject).forEach(binding => {
          if (binding.getTarget() === relatedObject) {
            binding.dispose();
          }
        });
      }

      let byRelatedObject = SingleValueBinding.__bindingsBySource[relatedObject.toHashCode()];
      if (byRelatedObject) {
        Object.values(byRelatedObject).forEach(binding => {
          if (binding.getTarget() === object) {
            binding.dispose();
          }
        });
      }
    },

    /**
     * Helper method that sets a value for a named property
     *
     * @param {qx.core.Object} target object to have a property set
     * @param {String} propertyName the name of the property
     * @param {Object?} value the value to set
     */
    set(target, propertyName, value) {
      let prop = qx.util.PropertyUtil.getProperty(target.constructor, propertyName);
      if (!prop) {
        let setFuncName = "set" + qx.lang.String.firstUp(propertyName);
        if (typeof target[setFuncName] == "function") {
          return target[setFuncName](value);
        } else {
          throw new Error(`Property ${propertyName} not found on ${target.classname}`);
        }
      }

      if (prop.isAsync()) {
        return prop.setAsync(target, value);
      } else {
        return prop.set(target, value);
      }
    },

    /**
     * Helper method to get a value of a named property
     *
     * @param {qx.core.Object} target object to have a property get
     * @param {String} propertyName the name of the property
     * @returns {Object?} the property value
     */
    get(target, propertyName) {
      let prop = qx.util.PropertyUtil.getProperty(target.constructor, propertyName);
      if (prop.isAsync()) {
        return prop.getAsync(target);
      } else {
        return prop.get(target);
      }
    },

    /**
     * Helper method that resets a named property
     *
     * @param {qx.core.Object} target object to have a property set
     * @param {String} propertyName the name of the property
     
     */
    reset(target, propertyName) {
      let prop = qx.util.PropertyUtil.getProperty(target.constructor, propertyName);
      if (!prop) {
        let setFuncName = "reset" + qx.lang.String.firstUp(propertyName);
        if (typeof target[setFuncName] == "function") {
          return target[setFuncName]();
        } else {
          throw new Error(`Property ${propertyName} not found on ${target.classname}`);
        }
      }

      if (prop.isAsync()) {
        return prop.resetAsync(target);
      } else {
        return prop.reset(target);
      }
    },

    /**
     *
     * Internal helper for getting the current set value at the property chain.
     *
     * @param {qx.core.Object} object  The source of the binding.
     * @param {String} propertyChain The property chain which represents
     *   the source property.
     * @return {var?undefined} Returns the set value if defined.
     */
    resolvePropertyChain(object, propertyChain) {
      let segments = qx.data.SingleValueBinding.__parseSegments(null, propertyChain);
      let out;
      let receiver = {
        setInput(value) {
          out = value;
        }
      };
      segments.at(-1).setOutputReceiver(receiver);
      let promise = segments[0].setInput(object);

      const cb = () => {
        let first = segments[0];
        if (first instanceof qx.data.binding.PropNameSegment) {
          let property = qx.Class.getByProperty(object.constructor, first.getPropName());
          qx.core.Assert.assertNotNull(property, `Object ${object.classname} does not have property ${first.getPropName()}`);
        }
        segments.forEach(segment => segment.dispose());
        return out;
      };

      if (qx.Promise.isPromise(promise)) {
        return promise.then(cb);
      } else {
        return cb();
      }
    },

    /**
     * Parses a path and creates an array of `qx.data.binding.AbstractSegment`
     *
     * @param {String} path the path to parse
     * @return {qx.data.binding.AbstractSegment[]?} the new array of segments
     */
    __parseSegments(binding, path) {
      let segsStrings = qx.data.SingleValueBinding.splitSegments(path);
      let segments = [];

      for (let seg of segsStrings) {
        //if it's an array index:
        if (seg.startsWith("[")) {
          segments.push(new qx.data.binding.ArrayIndexSegment(binding, seg));
        } else {
          //otherwise, it's a normal path
          segments.push(new qx.data.binding.PropNameSegment(binding, seg));
        }
      }

      segments.forEach((seg, index) => {
        if (index < segments.length - 1) {
          seg.setOutputReceiver(segments[index + 1]);
        }
      });

      return segments;
    }
  }
});
