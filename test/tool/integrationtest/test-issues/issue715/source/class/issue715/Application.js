/**
 * @require(qx.core.BaseInit)
 */
qx.Class.define("issue715.Application", {
  extend: qx.application.Basic,
  properties: {
    myProp: {
      init: null,
      nullable: true,
      apply: "__applyMyProp"
    }
  },
  members: {
    __privateOne: 1,
    
    main() {
      this.base(arguments);

      this["__privateOne"] = "one";
      this["__privateTwo"] = "two";
      this.__privateOne = "ONE";
      this.__privateTwo = "TWO";
    },
    
    __applyMyProp() {
      // Nothing
    }
  },
  statics: {
    __privateStaticOne: 1,
    
    test: function() {
      issue715.Application["__privateStaticOne"] = "one";
      issue715.Application["__privateStaticTwo"] = "two";
      issue715.Application.__privateStaticOne = "ONE";
      issue715.Application.__privateStaticTwo = "TWO";
    }
  }
});
