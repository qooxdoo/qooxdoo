// Platform-agnostic tests for qx-oo

testrunner.define({

  classname : "Core",

  testFeatures : function()
  {
    this.assertObject(qx.Class);
    this.assertObject(qx.Interface);
    this.assertObject(qx.Mixin);
  }
});