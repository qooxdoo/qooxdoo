/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This mixin offers the basic property features which include generic
 * setter, getter and resetter.
 */
qx.Mixin.define("qx.core.MProperty", {
  members: {
    /**
     * Sets either multiple properties at once by using a property
     * list or sets one property and its value by the first and
     * second argument. As a fallback, if no generated property
     * setter could be found, a handwritten setter will be searched
     * and invoked if available.
     *
     * @param data {Object | String}
     *   a map of property values. The key is the name of the property.
     *
     * @param value {var?}
     *   the value, only used when <code>data</code> is a string.
     *
     * @return {Object}
     *   Returns this instance if <code>data</code> is a map or a
     *   non-generated setter is called; otherwise returns
     *   <code>value</code>.
     *
     * @throws {Error} if a property defined does not exist
     */
    set(data, value) {
      // If there's just a single property name and value, convert
      // it to a map as if there were multiple property names and
      // values.
      if (qx.Bootstrap.isString(data)) {
        data = {
          [data]: value
        };
      }

      // Set each property specified in the map
      for (let prop in data) {
        // Otherwise, see if there's a hand-written setter method
        if (this["set" + qx.Bootstrap.firstUp(prop)] != undefined) {
          this["set" + qx.Bootstrap.firstUp(prop)](data[prop]);
          continue;
        }
        // Neither was true
        throw new Error("No such property: " + prop + " in " + this.classname + " (" + this + ")");
      }

      // Allow for the case where no properties were given
      return this;
    },

    /**
     * Sets a property or multiple properties asynchronously.
     * First tries calling `setPropetyNameAsync` if it exists,
     * otherwise falls back to `setPropertyName`.
     *
     * @overload
     * @param {string} data Name of property to set
     * @param {*} value Value to set it to
     *
     * @overload
     * @param {Object<string, *>} data Map of properties to set
     *
     * @returns {qx.core.Object | Promise<*>} This instance if a map was provided,
     * or, if a single property is set,
     * a promise which resolves when the setting has completed
     * to the set value of the property.
     */
    async setAsync(data, value) {
      const setValueImpl = async (propName, value) => {
        let upname = qx.Bootstrap.firstUp(propName);
        let setterName = "set" + upname + "Async";

        if (!this[setterName]) {
          setterName = "set" + upname;
        }

        if (qx.core.Environment.get("qx.debug")) {
          if (!this[setterName]) {
            throw new Error(`No such property: ${propName} in ${this.classname} (${this})`);
          }
        }

        return await this[setterName](value);
      };

      if (qx.Bootstrap.isString(data)) {
        return await setValueImpl(data, value);
      }

      for (let propName in data) {
        await setValueImpl(propName, data[propName]);
      }
      return this;
    },

    /**
     * Returns the value of the given property. If no generated getter could
     * be found, a fallback tries to access a handwritten getter.
     *
     * @param prop {String}
     *   Name of the property.
     *
     * @return {var}
     *   The value of the value
     *
     * @param safe {Boolean?false}
     *
     * @throws {Error}
     *   if a property defined does not exist
     */
    get(prop, safe) {
      if (safe) {
        let property = qx.Class.getByProperty(this.constructor, prop);
        if (property) {
          return property.getSafe(this);
        }
      }

      // Otherwise, see if there's a hand-written getter method
      if (this["get" + qx.Bootstrap.firstUp(prop)] != undefined) {
        return this["get" + qx.Bootstrap.firstUp(prop)]();
      }

      // If the property exists as a member variable, get it directly
      if (prop in this) {
        return this[prop];
      }

      throw new Error("No such property: " + prop);
    },

    /**
     *
     * Returns the value of the given property.
     * If the property is not initialized, it will return undefined.
     *
     * @param prop {String}
     *   Name of the property.
     *
     * @returns {*}
     */
    getSafe(prop) {
      return this.get(prop, true);
    },

    /**
     * Resets the value of the given property. If no generated resetter
     * could be found, a handwritten resetter will be invoked, if available.
     *
     * @param prop {String}
     *   Name of the property.
     *
     * @throws {Error}
     *   if a property defined does not exist
     */
    reset(prop) {
      // Reset the property
      if (this["reset" + qx.Bootstrap.firstUp(prop)] != undefined) {
        return this["reset" + qx.Bootstrap.firstUp(prop)]();
      }

      throw new Error("No such property: " + prop);
    }
  }
});
