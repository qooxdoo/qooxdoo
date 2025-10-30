/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2023-24 Zenesis Limited (https://www.zenesis.com)

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (github.com/johnspackman)

************************************************************************ */

/**
 * Property implementation for property groups
 */
qx.Bootstrap.define("qx.core.property.GroupProperty", {
  extend: Object,
  implement: qx.core.property.IProperty,

  construct(propertyName, clazz) {
    super();
    this.__propertyName = propertyName;
    this.__clazz = clazz;
  },

  members: {
    /** @type{String} the name of the property */
    __propertyName: null,

    /** @type{qx.Class} the class that defined the property */
    __clazz: null,

    /**
     * @Override
     */
    clone(clazz) {
      let clone = new qx.core.property.GroupProperty(this.__propertyName);
      clone.__clazz = clazz;
      return clone;
    },

    /**
     * @Override
     */
    configure(def) {
      this.__definition = def;

      if (qx.core.Environment.get("qx.debug")) {
        let allProperties = this.__clazz.prototype.$$properties;

        // Validate that group contains only existing properties, and if
        // themeable contains only themeable properties
        for (let propertyName of def.group) {
          if (!(propertyName in allProperties)) {
            throw new Error(
              `Class ${this.__clazz.classname}: ` +
                `Property group '${this.__propertyName}': ` +
                `property '${propertyName}' does not exist`
            );
          }

          if (allProperties[propertyName] instanceof qx.core.property.GroupProperty) {
            throw new Error(
              `Class ${this.__clazz.classname}: ` +
                `Property group '${this.__propertyName}': ` +
                `can not add group '${propertyName}' to a group`
            );
          }

          if (def.themeable && !allProperties[propertyName].isThemeable()) {
            throw new Error(
              `Class ${this.__clazz.classname}: ` +
                `Property group '${this.__propertyName}': ` +
                `can not add themeable property '${propertyName}' to ` +
                "non-themeable group"
            );
          }
        }
      }
    },

    /**
     * @Override
     */
    defineProperty(clazz, patch) {
      let propertyName = this.getPropertyName();
      let scopePrefix = "";
      if (propertyName.startsWith("__")) {
        scopePrefix = "__";
        propertyName = propertyName.substring(2);
      } else if (propertyName.startsWith("_")) {
        scopePrefix = "_";
        propertyName = propertyName.substring(1);
      }
      let upname = qx.Bootstrap.firstUp(propertyName);
      let self = this;

      const addMethod = (name, func) => {
        clazz.prototype[scopePrefix + name] = func;
        qx.Bootstrap.setDisplayName(func, clazz.classname, "prototype." + name);
      };

      // theme-specified
      if (this.__definition.themeable) {
        addMethod("setThemed" + upname, function (value) {
          self.setThemed(this, value);
        });

        addMethod("resetThemed" + upname, function () {
          self.resetThemed(this);
        });
      }

      // Native property value
      Object.defineProperty(clazz.prototype, propertyName, {
        get: function () {
          return undefined;
        },
        set: function (value) {
          self.set(this, value);
        },
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });

      addMethod("set" + upname, function (...args) {
        return self.set(this, ...args);
      });
      addMethod("reset" + upname, function (...args) {
        self.reset(this, ...args);
      });
    },

    /**
     * Sets a value
     *
     * @param {qx.core.Object} thisObj
     * @param  {...any} args
     */
    set(thisObj, ...args) {
      this.__iterateProperties((propertyName, value) => (thisObj[propertyName] = value), thisObj, ...args);
    },

    /**
     * Resets a value
     *
     * @param {qx.core.Object} thisObj
     * @param  {...any} args
     */
    reset(thisObj, value) {
      this.__iterateProperties(
        (propertyName, value) => {
          let upname = qx.Bootstrap.firstUp(propertyName);
          thisObj[`reset${upname}`]();
        },
        thisObj,
        ...args
      );
    },

    /**
     * Sets a themed value
     *
     * @param {qx.core.Object} thisObj
     * @param  {...any} args
     */
    setThemed(thisObj, ...args) {
      this.__iterateProperties(
        (propertyName, value) => {
          let upname = qx.Bootstrap.firstUp(propertyName);
          thisObj[`setThemed${upname}`](value);
        },
        thisObj,
        ...args
      );
    },

    /**
     * Resets a themed value
     *
     * @param {qx.core.Object} thisObj
     * @param  {...any} args
     */
    resetThemed(thisObj) {
      this.__iterateProperties((propertyName, value) => {
        let upname = qx.Bootstrap.firstUp(propertyName);
        thisObj[`resetThemed${upname}`]();
      }, thisObj);
    },

    /**
     * Iterates all the properties, with the value to set
     *
     * @param {Function} callback which is passed the propertyName and value
     * @param {qx.core.Object} thisObj
     * @param  {...any} args
     */
    __iterateProperties(callback, thisObj, ...args) {
      // No arguments (eg a `resetXxx` method)
      if (!args || !args.length) {
        for (let i = 0; i < this.__definition.group.length; i++) {
          callback(this.__definition.group[i]);
        }
        return;
      }

      // We can have received separate arguments, or a single array of arguments. Convert the former to the latter if
      // necessary.
      if (args.length == 1 && qx.lang.Type.isArray(args[0])) {
        args = args[0];
      }
      args = qx.lang.Array.clone(args);

      for (let i = 0; i < this.__definition.group.length && args.length > 0; i++) {
        let value = args.shift();
        callback(this.__definition.group[i], value);

        // If we're in shorthand mode, we may reuse that value. Put it back at the end of the argument
        // list.
        args.push(value);
      }
    },

    /**
     * Returns the property name
     *
     * @returns {String}
     */
    getPropertyName() {
      return this.__propertyName;
    },

    /**
     * Returns the event name
     *
     * @returns {String?}
     */
    getEventName() {
      return null;
    },

    /**
     * @Override
     */
    isInheritable() {
      return null;
    },

    /**
     * @Override
     */
    toString() {
      return this.__clazz.classname + "." + this.__propertyName;
    }
  }
});
