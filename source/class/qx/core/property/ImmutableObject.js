qx.Class.define("qx.core.property.ImmutableArray", {
  extend: qx.core.property.SimpleProperty,

  members: {
    /**
     * @Override
     */
    set(thisObj, value) {
      let oldValue = this.get(thisObj);
      if (oldValue) {
        Object.keys(this[prop]).forEach(key => delete this[prop][key]);
        Object.assign(this[prop], value);
      } else {
        thisObj["$$propertyValues"][this.__propertyName] = value;
      }
    }
  }
});
