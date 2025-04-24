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

  construct(sourcePath, targetPath, source, target) {
    super();
    const init = async () => {
      await this.setSourcePath(sourcePath);
      await this.setTargetPath(targetPath);
      await this.setSource(source);
      await this.setTarget(target);
    };
    this.__initPromise = init();
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
    /** @type{Promise} initialisation promise */
    __initPromise: null,

    /** @type{qx.data.binding.ISegment[]?} list of segments of the source path */
    __sourceSegments: null,

    /** @type{qx.data.binding.ISegment[]?} list of segments of the target path */
    __targetSegments: null,

    /**
     * Promises/A+ thenable compliance, this means that you can await the binding for initialisation
     * https://promisesaplus.com/
     */
    then(onFulfilled, onRejected) {
      return this.__initPromise.then(onFulfilled, onRejected);
    },

    /**
     * Tries to set the value immediately; if any part of the path returns a promise then it will
     * complete asynchronously, but synchronous operations will happen immediately.  This is to preserve
     * the behaviour from synchronous binding for backwards compatibility
     *
     * @async this may return a promise
     */
    executeImmediate() {
      let source = this.getSource();
      if (source && this.__sourceSegments && this.__sourceSegments[0]) {
        return this.__sourceSegments[0].executeImmediate(source);
      } else {
        return this.setValue(source);
      }
    },

    /**
     * Apply for `sourcePath`
     */
    _applySourcePath(value, oldValue) {
      this.__sourceSegments = this.__parseSegments(
        this.__sourceSegments,
        value,
        this
      );

      let source = this.getSource();
      if (source && this.__sourceSegments && this.__sourceSegments[0]) {
        return this.__sourceSegments[0].setValue(source);
      } else {
        return this.setValue(source);
      }
    },

    /**
     * Apply for `source`
     */
    async _applySource(value, oldValue) {
      if (oldValue) {
        qx.data.binding.Binding.__removeBinding(this, oldValue);
      }
      if (value) {
        qx.data.binding.Binding.__storeBinding(this, value);
      }
      if (value && this.__sourceSegments && this.__sourceSegments[0]) {
        await this.__sourceSegments[0].setValue(value);
      } else {
        await this.setValue(value);
      }
    },

    /**
     * Apply for `targetPath`
     */
    async _applyTargetPath(value, oldValue) {
      this.__targetSegments = this.__parseSegments(
        this.__targetSegments,
        value
      );

      let targetValue = this.getValue();
      if (targetValue && this.__targetSegments[0]) {
        await this.__targetSegments[0].setValue(targetValue);
      }
      if (this.__targetSegments) {
        let lastSegment = this.__targetSegments
          ? this.__targetSegments[this.__targetSegments.length - 1]
          : null;
        lastSegment.addListener("changeValue", this.__updateTarget, this);
      }
    },

    /**
     * Apply for `target`
     */
    async _applyTarget(value, oldValue) {
      if (oldValue) {
        qx.data.binding.Binding.__removeBinding(this, oldValue);
      }
      if (value) {
        qx.data.binding.Binding.__storeBinding(this, value);
      }
      if (value && this.__targetSegments && this.__targetSegments[0]) {
        await this.__targetSegments[0].setValue(value);
      }
      await this.__updateTarget();
    },

    /**
     * Apply for `value`
     */
    async _applyValue(value) {
      await this.__updateTarget();
    },

    /**
     * Parses a path and creates an array of `qx.data.binding.ISegment`
     *
     * @param {qx.data.binding.ISegment[]?} segments current segments, all of which are disposed
     * @param {String} path the path to parse
     * @param {qx.data.binding.ISegment} lastSegment the last segment, if null a TargetSegment is created
     * @return {qx.data.binding.ISegment[]?} the new array of segments
     */
    __parseSegments(segments, path, lastSegment) {
      if (segments) {
        segments.forEach(segment => segment.dispose());
        segments = null;
      }
      if (path) {
        let segs = path.split(".");
        segments = [];
        for (let i = segs.length - 1; i >= 0; i--) {
          let seg = segs[i];
          let segment;
          if (!lastSegment) {
            lastSegment = new qx.data.binding.TargetSegment(seg);
          } else if (seg.indexOf("[") > -1) {
            segment = new qx.data.binding.ArraySegment(seg, lastSegment);
          } else {
            segment = new qx.data.binding.Segment(seg, lastSegment);
          }
          segments.unshift(segment);
        }
      }
    },

    /**
     * Updates the target with the current value
     */
    async __updateTarget() {
      let lastSegment = this.__targetSegments
        ? this.__targetSegments[this.__targetSegments.length - 1]
        : null;
      if (lastSegment) {
        await lastSegment.setTargetValue(this.getValue());
      }
    }
  },

  statics: {
    /** @type{Object<String,Map<String,Binding>>} map of maps, outer map is indexed by object hash, inner is indexed by binding hash */
    __bindings: {},

    /**
     * Stores an association between a binding and an object (either as a source or target)
     *
     * @param {qx.data.binding.Binding} binding
     * @param {qx.core.Object} object
     */
    __storeBinding(binding, object) {
      let bindings = qx.data.binding.Binding.__bindings[object.toHashCode()];
      if (!bindings) {
        bindings = qx.data.binding.Binding.__bindings[object.toHashCode()] = {};
      }
      bindings[binding.toHashCode()] = binding;
    },

    /**
     * Removes an association between a binding and an object (either as a source or target)
     *
     * @param {qx.data.binding.Binding} binding
     * @param {qx.core.Object} object
     */
    __removeBinding(binding, object) {
      let bindings = qx.data.binding.Binding.__bindings[object.toHashCode()];
      delete bindings[binding.toHashCode()];
      if (qx.lang.Object.isEmpty(bindings)) {
        delete qx.data.binding.Binding.__bindings[object.toHashCode()];
      }
    },

    /**
     * Finds all bindings for an object, as either a source or target
     *
     * @param {qx.core.Object} object
     * @returns {qx.data.binding.Binding[]}
     */
    getAllBindingsForObject(object) {
      let bindings = qx.data.binding.Binding.__bindings[object.toHashCode()];
      if (!bindings) {
        return [];
      }
      return Object.values(bindings);
    },

    /**
     * Returns all bindings for all objects
     *
     * @returns {qx.data.binding.Binding[]}
     */
    getAllBindings() {
      let bindings = qx.data.binding.Binding.__bindings;
      let result = {};
      Object.keys(qx.data.binding.Binding.__bindings).forEach(map => {
        Object.values(map).forEach(hash => (result[hash] = map[hash]));
      });
      return Object.values(result);
    },

    /**
     * Helper method that sets a value for a named property
     *
     * @param {qx.core.Object} target object to have a property set
     * @param {String} propertyName the name of the property
     * @param {Object?} value the value to set
     */
    async set(target, propertyName, value) {
      let upname = qx.lang.String.firstUp(propertyName);
      let setName = "set" + upname + "Async";
      if (typeof target[setName] === undefined) {
        setName = "set" + upname;
      }
      await target[setName](value);
    },

    /**
     * Helper method to get a value of a named property
     *
     * @param {qx.core.Object} target object to have a property get
     * @param {String} propertyName the name of the property
     * @returns {Object?} the property value
     */
    async get(target, propertyName) {
      let upname = qx.lang.String.firstUp(propertyName);
      let getName = "get" + upname + "Async";
      if (typeof target[getName] === undefined) {
        getName = "get" + upname;
      }
      let value = await target[getName]();
      return value;
    }
  }
});
