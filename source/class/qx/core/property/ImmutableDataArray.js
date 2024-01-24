qx.Class.define("qx.core.property.ImmutableArray", {
  extend: qx.core.property.SimpleProperty,

  members: {
    /**
     * @Override
     */
    set(thisObj, value) {
      let oldValue = this.get(thisObj);
      if (oldValue) {
        oldValue.replace(value || []);
      } else {
        thisObj["$$propertyValues"][this.__propertyName] = value;
      }
    }
  }
});
