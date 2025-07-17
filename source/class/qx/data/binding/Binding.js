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

************************************************************************ */

/**
 * This class implements bindings as a first class object.  All properties are
 * assumed to be asynchronous.
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
 */
qx.Class.define("qx.data.binding.Binding", {
  extend: qx.core.Object,

  /**
   * @see {qx.data.SingleValueBindingAsync} Has same signature as
   */
  construct(sourcePath, targetPath, source, target, options) {
    super();
    this.__options = options ?? {};
    let tracker = {};
    const Utils = qx.event.Utils;
    Utils.then(tracker, () => this.setSourcePath(sourcePath));
    Utils.then(tracker, () => this.setTargetPath(targetPath));
    Utils.then(tracker, () => this.setSource(source));
    this.__initPromise = Utils.then(tracker, () => this.setTarget(target));
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
    qx.data.binding.Binding.__removeBinding(this, this.getSource(), this.getTarget());
  },

  properties: {
    /** The "value" is the final value obtained from the sourcePath */
    value: {
      init: null,
      nullable: true,
      event: "changeValue",
      apply: "_applyValue"
    },

    /** The path into the `source` object */
    sourcePath: {
      init: null,
      nullable: true,
      check: "String",
      event: "changeSourcePath",
      apply: "_applySourcePath"
    },

    /** The source object to get the `value` by looking up `sourcePath` */
    source: {
      init: null,
      nullable: true,
      event: "changeSource",
      apply: "_applySource"
    },

    /** The path into the `target` object */
    targetPath: {
      init: null,
      nullable: true,
      check: "String",
      event: "changeTargetPath",
      apply: "_applyTargetPath"
    },

    /** The target object to set the `value` by looking up `targetPath` */
    target: {
      init: null,
      nullable: true,
      event: "changeTarget",
      apply: "_applyTarget"
    }
  },

  members: {
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
     * @returns {Promise} A promise which resolves when the initial value has been copied over from source to target
     */
    getInitPromise() {
      return this.__initPromise;
    },

    /**
     * Apply for `sourcePath`
     */
    _applySourcePath(value, oldValue) {
      this.__sourceSegments = qx.data.binding.Binding.__parseSegments(this.__sourceSegments, value, this);
      let lastSegment = this.__sourceSegments?.at(-1);
      lastSegment?.addListener("changeOutput", evt => this.setValue(evt.getData()));

      let source = this.getSource();
      if (source && this.__sourceSegments && this.__sourceSegments[0]) {
        return this.__sourceSegments[0].setInput(source);
      } else {
        return this.setValue(source);
      }
    },

    /**
     * Apply for `source`
     */
    _applySource(value, oldValue) {
      if (value && this.getSourcePath()) {
        let promise = this.__sourceSegments[0].setInput(value);
        const cb = () =>
          this.assertNotNull(
            this.__sourceSegments[0].getEventName(),
            `Binding property ${this.__sourceSegments[0].toString()} of object ${value.classname} not possible. No event available.`
          );

        if (qx.Promise.isPromise(promise)) {
          return promise.then(cb);
        } else {
          return cb();
        }
      } else {
        return this.setValue(value);
      }
    },

    /**
     * Apply for `targetPath`
     */
    _applyTargetPath(value, oldValue) {
      this.__targetSegments = qx.data.binding.Binding.__parseSegments(this.__targetSegments, value);

      let targetValue = this.getTarget();
      let ret = null;
      if (value) {
        ret = this.__targetSegments[0].setInput(targetValue);
      }
      if (this.__targetSegments) {
        let lastSegment = this.__targetSegments ? this.__targetSegments[this.__targetSegments.length - 1] : null;
        lastSegment.addListener("changeInput", this.__updateTarget, this);
      }
      return ret;
    },

    /**
     * Apply for `target`
     */
    _applyTarget(value, oldValue) {
      if (value && this.getTargetPath()) {
        qx.data.binding.Binding.__storeBinding(this, this.getSource(), value);
        let promise = this.__targetSegments[0].setInput(value);
        if (qx.Promise.isPromise(promise)) {
          return promise.then(() => this.__updateTarget());
        } else {
          this.__updateTarget();
        }
      }
    },

    /**
     * Apply for `value`
     */
    _applyValue(value) {
      return this.__updateTarget();
    },

    /**
     * Updates the target with the current value
     */
    __updateTarget() {
      if (this.__targetSegments) {
        for (let segment of this.__targetSegments) {
          if (!segment.getEventName()) {
            segment.updateOutput();
          }
        }
      }

      let lastSegment = this.__targetSegments ? this.__targetSegments[this.__targetSegments.length - 1] : null;

      if (lastSegment && lastSegment.getInput()) {
        let value = this.getValue();
        if (this.__options.converter && !(this.__options.ignoreConverter && this.__options.ignoreConverter === this.getSourcePath())) {
          value = this.__options.converter(value, null, this.getSource(), this.getTarget());
        }
        if (this.__options.onUpdate) {
          this.__options.onUpdate(this.getSource(), this.getTarget(), value);
        }

        return lastSegment.setTargetValue(value);
      }
    }
  },

  statics: {
    /**
     *
     * @param {string} path
     * @returns {string[]} an array of segments, split by dot and square brackets.
     * For example, `a.b[0].c` will return `["a", "b", "[0]", "c"]`
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

    /** @type {Object<String,Object<String,Binding>>} map of maps, outer map is indexed by object hash, inner is indexed by binding hash */
    __bindingsBySource: {},

    /** @type {Object<String,Object<String,Binding>>} map of maps, outer map is indexed by object hash, inner is indexed by binding hash */
    __bindingsByTarget: {},

    /**
     * Stores an association between a binding and an object (either as a source or target)
     *
     * @param {qx.data.binding.Binding} binding
     * @param {qx.core.Object} source
     */
    __storeBinding(binding, source, target) {
      let Binding = qx.data.binding.Binding;
      Binding.__bindingsBySource[source.toHashCode()] ??= {};
      Binding.__bindingsBySource[source.toHashCode()][binding.toHashCode()] = binding;
      Binding.__bindingsByTarget[target.toHashCode()] ??= {};
      Binding.__bindingsByTarget[target.toHashCode()][binding.toHashCode()] = binding;
    },

    /**
     * Removes an association between a binding and an object (either as a source or target)
     *
     * @param {qx.data.binding.Binding} binding
     * @param {qx.core.Object} source
     */
    __removeBinding(binding, source, target) {
      let bindings = qx.data.binding.Binding.__bindingsBySource[source.toHashCode()];
      delete bindings[binding.toHashCode()];
      if (qx.lang.Object.isEmpty(bindings)) {
        delete qx.data.binding.Binding.__bindingsBySource[source.toHashCode()];
      }

      bindings = qx.data.binding.Binding.__bindingsByTarget[target.toHashCode()];
      delete bindings[binding.toHashCode()];
      if (qx.lang.Object.isEmpty(bindings)) {
        delete qx.data.binding.Binding.__bindingsByTarget[target.toHashCode()];
      }
    },

    /**
     * Finds all bindings for an object, as either a source or target
     *
     * @param {qx.core.Object} object
     */
    getAllBindingsForObject(object) {
      const Binding = qx.data.binding.Binding;
      let allBindings = {
        ...(Binding.__bindingsBySource[object.toHashCode()] ?? {}),
        ...(Binding.__bindingsByTarget[object.toHashCode()] ?? {})
      };
      return Object.values(allBindings).map(binding => [
        binding,
        binding.getSource(),
        binding.getSourcePath(),
        binding.getTarget(),
        binding.getTargetPath()
      ]);
    },

    /**
     * Returns a map containing for every bound object an array of data binding
     * information. The key of the map is the hash code of the bound objects.
     * Every binding is represented by an array containing id, sourceObject,
     * sourceEvent, targetObject and targetProperty.
     *
     * @return {Object<string, BindingInfo>} Map containing all bindings.
     *
     * @typedef {[qx.data.binding.Binding, qx.core.Object, string, qx.core.Object, string]} BindingInfo
     * Stores the binding ID, source object, source path, target object and target path respectively.
     */
    getAllBindings() {
      let bindings = qx.data.binding.Binding.__bindingsBySource;

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
     * @param {qx.core.Object} object
     * @param {qx.core.Object} relatedObject
     */
    removeRelatedBindings(object, relatedObject) {
      const Binding = qx.data.binding.Binding;

      let bySourceObject = Binding.__bindingsBySource[object.toHashCode()];
      Object.values(bySourceObject).forEach(binding => {
        if (binding.getTarget() === relatedObject) {
          binding.dispose();
        }
      });

      let byRelatedObject = Binding.__bindingsBySource[relatedObject.toHashCode()];
      Object.values(byRelatedObject).forEach(binding => {
        if (binding.getTarget() === object) {
          binding.dispose();
        }
      });
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
     *
     * Internal helper for getting the current set value at the property chain.
     *
     * @param {qx.core.Object} object  The source of the binding.
     * @param {String} propertyChain The property chain which represents
     *   the source property.
     * @return {var?undefined} Returns the set value if defined.
     */
    resolvePropertyChain(object, propertyChain) {
      let segments = qx.data.binding.Binding.__parseSegments(null, propertyChain);
      let promise = segments[0].setInput(object);

      const cb = () => {
        let first = segments[0];
        if (first instanceof qx.data.binding.PropNameSegment) {
          let property = qx.Class.getByProperty(object.constructor, first.getPropName());
          qx.core.Assert.assertNotNull(property, `Object ${object.classname} does not have property ${first.getPropName()}`);
        }
        let out = segments.at(-1).getOutput();
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
     * @param {qx.data.binding.AbstractSegment[]?} segments current segments, all of which are disposed
     * @param {String} path the path to parse
     * @return {qx.data.binding.AbstractSegment[]?} the new array of segments
     */
    __parseSegments(segments, path) {
      if (segments) {
        segments.forEach(segment => segment.dispose());
        segments = null;
      }
      if (path) {
        let segsStrings = qx.data.binding.Binding.splitSegments(path);
        segments = [];

        for (let seg of segsStrings) {
          //if it's an array index:
          if (seg.startsWith("[")) {
            segments.push(new qx.data.binding.ArrayIndexSegment(seg));
          } else {
            //otherwise, it's a normal path
            segments.push(new qx.data.binding.PropNameSegment(seg));
          }
        }

        segments.forEach((seg, index) => {
          if (index < segments.length - 1) {
            seg.addListener("changeOutput", evt => {
              let nextSegment = segments[index + 1];
              nextSegment.setInput(evt.getData());
            });
          }
        });

        return segments;
      }
    }
  }
});
